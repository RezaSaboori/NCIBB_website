from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from threading import Barrier
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db import close_old_connections, connection
from django.test import TestCase, TransactionTestCase, override_settings, skipUnlessDBFeature

from apps.user_management.models import GroupMembership, PlatformRoleAssignment, Role, UserGroup
from .models import CreditTransaction, JobReservation, UserCredit
from .policy import MAX_AMOUNT, monthly_period
from .services import CreditError, adjust_balance, finish_job, personal_wallet, reserve_job

User = get_user_model()


def account(name):
    return User.objects.create_user(username=name, email=f"{name}@example.test")


class WalletTests(TestCase):
    @override_settings(
        BEAT_COIN_JOB_PRICE="6",
        BEAT_COIN_PLATFORM_ALLOWANCES={"user": {"starter": 2, "monthly": 4}, "student": {"starter": 5, "monthly": 3}},
    )
    def test_month_rollover_reservations_and_replay(self):
        user = account("member")
        PlatformRoleAssignment.objects.create(user=user, role=Role.objects.get(code="student", scope="platform"))
        now = datetime(2026, 11, 20, 12, tzinfo=timezone.utc)
        period, reset = monthly_period(now)
        wallet, _ = personal_wallet(user, now)
        self.assertEqual(wallet.period, period)
        self.assertEqual((wallet.balance, wallet.monthly_balance), (Decimal("5"), Decimal("4")))
        reservation = reserve_job("test-job-1", user, now=now)
        self.assertEqual((reservation.monthly, reservation.permanent), (Decimal("4"), Decimal("2")))
        self.assertEqual(reserve_job("test-job-1", user, now=now).pk, reservation.pk)
        finish_job("test-job-1", succeeded=False, reason="cancelled", now=reset + timedelta(seconds=1))
        finish_job("test-job-1", succeeded=False, reason="retry", now=reset + timedelta(seconds=1))
        wallet, _ = personal_wallet(user, reset + timedelta(seconds=2))
        self.assertEqual((wallet.balance, wallet.monthly_balance), (Decimal("5"), Decimal("4")))
        self.assertEqual(CreditTransaction.objects.filter(reference_id="test-job-1", transaction_type="refund").count(), 1)
        self.assertEqual(CreditTransaction.objects.filter(reference_id="test-job-1", transaction_type="expiry").count(), 1)

    @override_settings(
        BEAT_COIN_PLATFORM_ALLOWANCES={"user": {"starter": 2, "monthly": 3}, "student": {"starter": 5, "monthly": 4}},
    )
    def test_role_changes_top_up_each_source_only_once(self):
        user = account("researcher")
        group = UserGroup.objects.create(name="Institution")
        membership = GroupMembership.objects.create(group=group, user=user)
        membership.roles.add(Role.objects.get(code="student", scope="group"))
        group_rules = {str(group.pk): {"student": {"starter": 7, "monthly": 9}}}
        with override_settings(BEAT_COIN_GROUP_ALLOWANCES=group_rules):
            wallet, reset = personal_wallet(user)
            self.assertEqual((wallet.balance, wallet.monthly_balance), (Decimal("9"), Decimal("12")))
            assignment = PlatformRoleAssignment.objects.create(
                user=user, role=Role.objects.get(code="student", scope="platform")
            )
            self.assertEqual(personal_wallet(user)[0].balance, Decimal("12"))
            assignment.delete()
            membership.active = False
            membership.save(update_fields=["active"])
            self.assertEqual(personal_wallet(user)[0].monthly_balance, Decimal("13"))
            wallet, _ = personal_wallet(user, reset + timedelta(seconds=1))
            self.assertEqual((wallet.balance, wallet.monthly_balance), (Decimal("12"), Decimal("3")))

    def test_persian_month_and_year_switch_at_tehran_midnight(self):
        before = datetime(2026, 3, 20, 20, 29, 59, tzinfo=timezone.utc)
        after = before + timedelta(seconds=1)
        self.assertEqual(monthly_period(before)[0], "1404-12")
        self.assertEqual(monthly_period(after)[0], "1405-01")
        self.assertEqual(monthly_period(before)[1], after)
        self.assertEqual(monthly_period(datetime(2026, 11, 22, 20, 29, 59, tzinfo=timezone.utc))[0], "1405-09")

    @override_settings(BEAT_COIN_JOB_PRICE="3")
    def test_group_permissions_and_adjustment_retries(self):
        group = UserGroup.objects.create(name="Research")
        admin, payer = account("manager"), account("payer")
        member = GroupMembership.objects.create(group=group, user=payer)
        key = uuid4()
        entry = adjust_balance(admin, amount=Decimal("3"), reason="Funding", request_id=key, group=group)
        self.assertEqual(entry.pk, adjust_balance(admin, amount=Decimal("3"), reason="Funding", request_id=key, group=group).pk)
        with self.assertRaisesRegex(CreditError, "idempotency_conflict"):
            adjust_balance(admin, amount=Decimal("4"), reason="Different", request_id=key, group=group)
        with self.assertRaisesRegex(CreditError, "wallet_forbidden"):
            reserve_job("group-job", payer, group=group)
        member.can_spend = True
        member.save()
        self.assertEqual(reserve_job("group-job", payer, group=group).shared, Decimal("3"))
        self.assertEqual(finish_job("group-job", succeeded=True, reason="complete").state, JobReservation.State.SETTLED)
        self.assertEqual(personal_wallet(payer)[0].balance, Decimal("0"))

    @override_settings(BEAT_COIN_JOB_PRICE="10")
    def test_adjustment_cannot_consume_the_space_reserved_for_a_refund(self):
        admin, user = account("admin"), account("user")
        adjust_balance(admin, amount=MAX_AMOUNT, reason="Limit", request_id=uuid4(), user=user)
        reserve_job("blocked-release", user)
        with self.assertRaisesRegex(CreditError, "balance_limit"):
            adjust_balance(admin, amount=Decimal("1"), reason="Extra", request_id=uuid4(), user=user)
        finish_job("blocked-release", succeeded=False, reason="cancelled")
        self.assertEqual(personal_wallet(user)[0].balance, MAX_AMOUNT)


@override_settings(BEAT_COIN_JOB_PRICE="6")
class ConcurrentWalletTests(TransactionTestCase):
    @skipUnlessDBFeature("has_select_for_update")
    def test_row_lock_prevents_concurrent_double_spend(self):
        admin, payer = account("manager"), account("payer")
        adjust_balance(admin, amount=Decimal("10"), reason="Seed", request_id=uuid4(), user=payer)
        start = Barrier(2, timeout=5)

        def worker(job_id):
            close_old_connections()
            try:
                user = User.objects.get(pk=payer.pk)
                start.wait()
                reserve_job(job_id, user)
                return "held"
            except CreditError as error:
                return error.code
            finally:
                connection.close()

        with ThreadPoolExecutor(2) as pool:
            result = list(pool.map(worker, ["job-1", "job-2"]))
        self.assertCountEqual(result, ["held", "insufficient_credits"])
        self.assertEqual(UserCredit.objects.get(user=payer).balance, Decimal("4"))
        self.assertEqual(JobReservation.objects.count(), 1)
