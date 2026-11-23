import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from django.utils.crypto import constant_time_compare
from rest_framework import serializers, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.exceptions import APIException, Throttled, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from credits.services import reward_verified_email
from .access import audit
from .models import EmailVerification


class VerificationThrottle(UserRateThrottle):
    scope = "email_verification"
    rate = "8/hour"


class ConfirmationThrottle(AnonRateThrottle):
    scope = "email_confirmation"
    rate = "30/hour"


def digest(secret):
    return hashlib.sha256(secret.encode()).hexdigest()


class VerificationUnavailable(APIException):
    status_code = 503
    default_detail = "Verification email could not be sent. Try again later."


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([VerificationThrottle])
@transaction.atomic
def send_verification(request):
    user = get_user_model().objects.select_for_update().get(pk=request.user.pk)
    if user.is_email_verified:
        return Response(status=status.HTTP_204_NO_CONTENT)
    now = timezone.now()
    existing = EmailVerification.objects.filter(user=user).first()
    if existing and existing.sent_at > now - timedelta(minutes=1):
        raise Throttled(wait=60)
    secret = secrets.token_urlsafe(32)
    verification, _ = EmailVerification.objects.update_or_create(
        user=user, defaults={
            "digest": digest(secret), "email": user.email, "expires_at": now + timedelta(hours=24),
            "used_at": None, "sent_at": now,
        },
    )
    url = f"{settings.PUBLIC_SITE_URL.rstrip('/')}/verify-email#token={user.pk}.{secret}"
    try:
        sent = send_mail(
            "تأیید ایمیل NCIBB",
            f"برای تأیید نشانی ایمیل، پیوند زیر را باز کنید. این پیوند ۲۴ ساعت اعتبار دارد.\n\n{url}",
            settings.DEFAULT_FROM_EMAIL, [verification.email],
        )
    except OSError as error:
        raise VerificationUnavailable() from error
    if not sent:
        raise VerificationUnavailable()
    return Response(status=status.HTTP_204_NO_CONTENT)


class ConfirmationSerializer(serializers.Serializer):
    token = serializers.RegexField(r"^\d{1,18}\.[A-Za-z0-9_-]{43}$", max_length=64)


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
@throttle_classes([ConfirmationThrottle])
@transaction.atomic
def confirm_verification(request):
    serializer = ConfirmationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user_id, secret = serializer.validated_data["token"].split(".")
    user = get_user_model().objects.select_for_update().filter(pk=user_id, is_active=True).first()
    verification = EmailVerification.objects.filter(user=user).first() if user else None
    if (
        not verification or verification.email != user.email or verification.expires_at <= timezone.now()
        or not constant_time_compare(verification.digest, digest(secret))
    ):
        raise ValidationError({"token": "Invalid or expired verification link."})
    if verification.used_at:
        return Response(status=status.HTTP_204_NO_CONTENT)
    user.is_email_verified = True
    user.save(update_fields=["is_email_verified", "updated_at"])
    reward_verified_email(user)
    verification.used_at = timezone.now()
    verification.save(update_fields=["used_at"])
    audit(user, "email_verified", subject=user)
    return Response(status=status.HTTP_204_NO_CONTENT)
