from decimal import Decimal

from rest_framework import serializers

from .models import CreditPackage, CreditTransaction


class CreditTransactionSerializer(serializers.ModelSerializer):
    actor = serializers.IntegerField(source="actor_id", read_only=True)
    user = serializers.IntegerField(source="user_id", read_only=True)
    group = serializers.IntegerField(source="group_id", read_only=True)

    class Meta:
        model = CreditTransaction
        fields = (
            "id", "user", "group", "actor", "amount", "bucket", "balance_after",
            "transaction_type", "description", "reference_id", "created_at",
        )
        read_only_fields = fields


class CreditPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditPackage
        fields = ("id", "name", "description", "credits", "price", "is_active", "created_at", "updated_at")
        read_only_fields = fields


class AdjustmentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    reason = serializers.CharField(max_length=500)
    request_id = serializers.UUIDField()

    def validate_amount(self, value):
        if not value:
            raise serializers.ValidationError("The adjustment must be nonzero.")
        return value


class AddCreditsSerializer(AdjustmentSerializer):
    user_id = serializers.IntegerField(min_value=1)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))
    reason = serializers.CharField(max_length=500, required=False)
    description = serializers.CharField(max_length=500, required=False)

    def validate(self, attrs):
        attrs["reason"] = attrs.get("reason") or attrs.pop("description", "")
        attrs.pop("description", None)
        if not attrs["reason"]:
            raise serializers.ValidationError({"reason": "An adjustment reason is required."})
        return attrs
