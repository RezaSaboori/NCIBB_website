from datetime import datetime, time
from decimal import Decimal, InvalidOperation
from zoneinfo import ZoneInfo

import jdatetime
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils import timezone

from apps.user_management.access import platform_roles
from apps.user_management.models import GroupMembership

ZERO = Decimal("0.00")
CENT = Decimal("0.01")
MAX_AMOUNT = Decimal("99999999.99")
TEHRAN = ZoneInfo("Asia/Tehran")


def policy_amount(value):
    try:
        amount = Decimal(str(value))
        if not amount.is_finite() or not ZERO <= amount <= MAX_AMOUNT or amount != amount.quantize(CENT):
            raise InvalidOperation()
        return amount.quantize(CENT)
    except (InvalidOperation, ValueError, TypeError):
        raise ImproperlyConfigured("Beat Coin settings require nonnegative amounts with up to two decimal places.") from None


def monthly_period(now=None):
    today = (now or timezone.now()).astimezone(TEHRAN).date()
    persian = jdatetime.date.fromgregorian(date=today)
    year, month = persian.year, persian.month
    next_year, next_month = (year + 1, 1) if month == 12 else (year, month + 1)
    next_day = jdatetime.date(next_year, next_month, 1).togregorian()
    return f"{year:04d}-{month:02d}", datetime.combine(next_day, time.min, TEHRAN)


def highest_amount(rules, codes, event):
    return max((policy_amount(rules.get(code, {}).get(event, ZERO)) for code in codes), default=ZERO)


def allowances(user):
    global_codes = {"user", *(role.code for role in platform_roles(user))}
    global_rules = settings.BEAT_COIN_PLATFORM_ALLOWANCES
    yield "platform", highest_amount(global_rules, global_codes, "starter"), highest_amount(
        global_rules, global_codes, "monthly",
    )
    memberships = GroupMembership.objects.filter(user=user, active=True).prefetch_related("roles")
    for membership in memberships:
        rules = settings.BEAT_COIN_GROUP_ALLOWANCES.get(str(membership.group_id), {})
        codes = [role.code for role in membership.roles.all()]
        yield f"group:{membership.group_id}", highest_amount(rules, codes, "starter"), highest_amount(
            rules, codes, "monthly",
        )
