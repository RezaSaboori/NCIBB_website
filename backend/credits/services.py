from django.conf import settings
from django.db import transaction

from apps.user_management.models import GroupMembership
from .models import CreditGrant, CreditTransaction, GroupWallet, JobReservation, UserCredit
from .policy import MAX_AMOUNT, ZERO, allowances, monthly_period, policy_amount


class CreditError(Exception):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


def lock_wallet(user):
    wallet, _ = UserCredit.objects.select_for_update().get_or_create(user=user)
    return wallet


def lock_group_wallet(group):
    wallet, _ = GroupWallet.objects.select_for_update().get_or_create(group=group)
    return wallet


def record(wallet, bucket, amount, kind, description, *, actor=None, reference="", key=None):
    field = "monthly_balance" if bucket == "monthly" else "balance"
    updated_balance = getattr(wallet, field) + amount
    if updated_balance < ZERO:
        raise CreditError("insufficient_credits")
    if updated_balance + getattr(wallet, f"held_{bucket}") > MAX_AMOUNT:
        raise CreditError("balance_limit")
    setattr(wallet, field, updated_balance)
    fields = [field, "updated_at"]
    if isinstance(wallet, UserCredit) and amount > ZERO and kind in ("grant", "adjustment"):
        wallet.total_earned += amount
        fields.append("total_earned")
    wallet.save(update_fields=fields)
    owner = {"group_id": wallet.group_id} if isinstance(wallet, GroupWallet) else {"user_id": wallet.user_id}
    return CreditTransaction.objects.create(
        **owner, actor=actor, amount=amount, bucket=bucket, transaction_type=kind,
        description=description, reference_id=reference, balance_after=updated_balance,
        idempotency_key=key,
    )


def grant(wallet, source, amount, *, period=""):
    if amount == ZERO:
        return
    award, _ = CreditGrant.objects.get_or_create(wallet=wallet, source=source, period=period)
    difference = amount - award.awarded
    if difference > ZERO:
        record(wallet, "monthly" if period else "permanent", difference, "grant", source)
        award.awarded = amount
        award.save(update_fields=["awarded"])


def reconcile(wallet, user, now=None):
    period, reset_at = monthly_period(now)
    if wallet.period != period:
        if wallet.monthly_balance:
            record(wallet, "monthly", -wallet.monthly_balance, "expiry", f"monthly:{wallet.period}")
        wallet.period = period
        wallet.held_monthly = ZERO
        wallet.save(update_fields=["period", "held_monthly", "updated_at"])
    if user.is_active:
        for source, starter, monthly in allowances(user):
            grant(wallet, source, starter)
            grant(wallet, source, monthly, period=period)
    return reset_at


@transaction.atomic
def personal_wallet(user, now=None):
    wallet = lock_wallet(user)
    reset_at = reconcile(wallet, user, now)
    return wallet, reset_at


@transaction.atomic
def reward_verified_email(user):
    wallet = lock_wallet(user)
    if CreditGrant.objects.filter(wallet=wallet, source="email_verification", period="").exists():
        return
    reward = policy_amount(settings.BEAT_COIN_EMAIL_REWARD)
    if reward:
        grant(wallet, "email_verification", reward)
    else:
        CreditGrant.objects.create(wallet=wallet, source="email_verification", awarded=ZERO)


@transaction.atomic
def adjust_balance(actor, *, amount, reason, request_id, user=None, group=None):
    wallet = lock_wallet(user) if user is not None else lock_group_wallet(group)
    if user is not None:
        reconcile(wallet, user)
    owner = f"user:{user.pk}" if user is not None else f"group:{group.pk}"
    key = f"adjustment:{owner}:{request_id}"
    previous = CreditTransaction.objects.filter(idempotency_key=key).first()
    if previous:
        if (previous.actor_id, previous.amount, previous.description) != (actor.pk, amount, reason):
            raise CreditError("idempotency_conflict")
        return previous
    return record(wallet, "permanent" if user is not None else "shared", amount, "adjustment",
                  reason, actor=actor, key=key)


def job_price():
    return policy_amount(settings.BEAT_COIN_JOB_PRICE)


@transaction.atomic
def reserve_job(job_id, user, *, group=None, now=None):
    job_id = str(job_id) if job_id is not None else ""
    if not job_id or len(job_id) > 100:
        raise CreditError("invalid_job_id")
    previous = JobReservation.objects.filter(job_id=job_id).first()
    if previous:
        return same_reservation(previous, user, group)
    if not user.is_active:
        raise CreditError("wallet_forbidden")

    price = job_price()
    if price == ZERO:
        raise CreditError("charging_disabled")
    monthly = permanent = shared = ZERO
    period = ""
    if group is None:
        wallet = lock_wallet(user)
        reconcile(wallet, user, now)
        monthly = min(wallet.monthly_balance, price)
        permanent = price - monthly
        period = wallet.period
    else:
        membership = GroupMembership.objects.select_for_update().filter(
            group=group, user=user, active=True, can_spend=True
        ).first()
        if membership is None:
            raise CreditError("wallet_forbidden")
        wallet = lock_group_wallet(group)
        shared = price

    reservation, created = JobReservation.objects.get_or_create(
        job_id=job_id,
        defaults={"user": user, "group": group, "monthly": monthly, "permanent": permanent,
                  "shared": shared, "period": period},
    )
    if not created:
        return same_reservation(reservation, user, group)
    for bucket, amount in (("monthly", monthly), ("permanent", permanent), ("shared", shared)):
        if amount:
            record(wallet, bucket, -amount, "reserve", "job_reservation", actor=user, reference=job_id)
            field = f"held_{bucket}"
            setattr(wallet, field, getattr(wallet, field) + amount)
            wallet.save(update_fields=[field, "updated_at"])
    return reservation


def same_reservation(reservation, user, group):
    if reservation.user_id != user.pk or reservation.group_id != getattr(group, "pk", None):
        raise CreditError("idempotency_conflict")
    return reservation


@transaction.atomic
def finish_job(job_id, *, succeeded, reason, now=None):
    reservation = JobReservation.objects.select_for_update(of=("self",)).select_related("user").get(job_id=job_id)
    target = JobReservation.State.SETTLED if succeeded else JobReservation.State.RELEASED
    if reservation.state == target:
        return reservation
    if reservation.state != JobReservation.State.HELD:
        raise CreditError("job_already_finished")

    if reservation.group_id:
        wallet = lock_group_wallet(reservation.group)
    else:
        wallet = lock_wallet(reservation.user)
        reconcile(wallet, reservation.user, now)
    for bucket in ("monthly", "permanent", "shared"):
        amount = getattr(reservation, bucket)
        if not amount:
            continue
        expired = bucket == "monthly" and reservation.period != wallet.period
        if not expired:
            field = f"held_{bucket}"
            setattr(wallet, field, getattr(wallet, field) - amount)
            wallet.save(update_fields=[field, "updated_at"])
        if succeeded:
            record(wallet, bucket, ZERO, "settle", reason, actor=reservation.user, reference=job_id)
        elif expired:
            record(wallet, bucket, ZERO, "expiry", "expired_job_reservation",
                   actor=reservation.user, reference=job_id)
        else:
            record(wallet, bucket, amount, "refund", reason, actor=reservation.user, reference=job_id)
    if succeeded and isinstance(wallet, UserCredit):
        wallet.total_spent += reservation.price
        wallet.save(update_fields=["total_spent", "updated_at"])
    reservation.state = target
    reservation.finish_reason = reason
    reservation.save(update_fields=["state", "finish_reason", "updated_at"])
    return reservation
