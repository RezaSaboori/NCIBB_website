from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils.cache import add_never_cache_headers
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.user_management.access import IsPlatformAdmin
from apps.user_management.models import GroupMembership
from .models import CreditPackage, CreditTransaction, GroupWallet
from .serializers import AddCreditsSerializer, CreditPackageSerializer, CreditTransactionSerializer
from .services import CreditError, adjust_balance, job_price, personal_wallet


def wallet_summary(user, *, include_groups=True):
    wallet, reset = personal_wallet(user)
    result = {
        "id": wallet.pk, "user": user.pk, "balance": str(wallet.balance + wallet.monthly_balance),
        "monthly_balance": str(wallet.monthly_balance), "permanent_balance": str(wallet.balance),
        "total_earned": str(wallet.total_earned), "total_spent": str(wallet.total_spent),
        "period": wallet.period, "reset_at": reset.isoformat(), "job_price": str(job_price()),
    }
    if include_groups:
        memberships = GroupMembership.objects.filter(user=user, active=True, can_spend=True).select_related("group")
        balances = {wallet.group_id: wallet.balance for wallet in GroupWallet.objects.filter(
            group_id__in=memberships.values_list("group_id", flat=True)
        )}
        result["groups"] = [
            {"id": member.group_id, "name": member.group.name,
             "balance": str(balances.get(member.group_id, "0.00"))}
            for member in memberships
        ]
    return result


class UserCreditView(generics.GenericAPIView):
    def get(self, request):
        response = Response(wallet_summary(request.user))
        add_never_cache_headers(response)
        return response


class CreditTransactionListView(generics.ListAPIView):
    serializer_class = CreditTransactionSerializer
    filterset_fields = ["transaction_type", "bucket"]
    search_fields = ["description"]
    ordering_fields = ["created_at", "amount"]

    def get_queryset(self):
        return CreditTransaction.objects.filter(user=self.request.user)


class CreditPackageListView(generics.ListAPIView):
    queryset = CreditPackage.objects.filter(is_active=True)
    serializer_class = CreditPackageSerializer


class CreditPackageDetailView(generics.RetrieveAPIView):
    queryset = CreditPackage.objects.filter(is_active=True)
    serializer_class = CreditPackageSerializer


def credit_error(error):
    return Response({"code": error.code, "detail": str(error)}, status=status.HTTP_409_CONFLICT)


@api_view(["POST"])
@permission_classes([IsPlatformAdmin])
def add_credits_view(request):
    serializer = AddCreditsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    values = serializer.validated_data
    user = get_object_or_404(get_user_model(), pk=values.pop("user_id"))
    try:
        entry = adjust_balance(request.user, user=user, **values)
    except CreditError as error:
        return credit_error(error)
    return Response({"new_balance": str(entry.balance_after), "transaction": CreditTransactionSerializer(entry).data})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def spend_credits_view(request):
    return Response(
        {"code": "job_required", "detail": "Credits are spent through a managed job."},
        status=status.HTTP_403_FORBIDDEN,
    )


@api_view(["GET"])
def credit_stats_view(request):
    data = wallet_summary(request.user)
    data["recent_transactions"] = CreditTransactionSerializer(
        CreditTransaction.objects.filter(user=request.user)[:10], many=True
    ).data
    return Response(data)
