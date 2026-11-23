from rest_framework import serializers

from .access import GROUP_CAPABILITIES, PUBLIC_CAPABILITIES, group_summary, role_summary
from .models import AuditEvent, GroupMembership, Role, UserGroup


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ("id", "code", "label", "scope", "capabilities", "builtin")
        read_only_fields = ("id", "builtin")

    def validate_capabilities(self, values):
        if not isinstance(values, list) or any(not isinstance(value, str) for value in values):
            raise serializers.ValidationError("Expected an array of permission codes.")
        return sorted(set(values))

    def validate(self, attrs):
        scope = attrs.get("scope", getattr(self.instance, "scope", None))
        codes = attrs.get("capabilities", getattr(self.instance, "capabilities", []))
        allowed = PUBLIC_CAPABILITIES if scope == Role.Scope.PLATFORM else GROUP_CAPABILITIES
        if set(codes) - allowed.keys():
            raise serializers.ValidationError({"capabilities": "Unknown or reserved permission."})
        if self.instance and (scope != self.instance.scope or attrs.get("code", self.instance.code) != self.instance.code):
            raise serializers.ValidationError({"code": "Role code and scope are permanent."})
        return attrs


class UserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGroup
        fields = ("id", "name", "parent")
        read_only_fields = ("id",)

    def validate_parent(self, parent):
        ancestor = parent
        while ancestor and self.instance:
            if ancestor.pk == self.instance.pk:
                raise serializers.ValidationError("A group cannot be its own ancestor.")
            ancestor = ancestor.parent
        return parent


class UserDirectorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
    is_email_verified = serializers.BooleanField()
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    last_login = serializers.DateTimeField(allow_null=True)
    roles = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()

    def get_roles(self, user):
        roles = [role_summary(assignment.role) for assignment in user.platform_roles.all()]
        roles.insert(0, {"id": None, "code": "user", "label": "کاربر"})
        if user.is_superuser and not any(role["code"] == "admin" for role in roles):
            roles.append({"id": None, "code": "admin", "label": "مدیر سامانه"})
        return roles

    def get_groups(self, user):
        return [group_summary(membership) for membership in user.group_memberships.all() if membership.active]

    def get_balance(self, user):
        wallet = getattr(user, "credits", None)
        from credits.policy import monthly_period

        if not wallet:
            return "0.00"
        return str(wallet.balance + wallet.monthly_balance) if wallet.period == monthly_period()[0] else str(wallet.balance)


class AccountAccessSerializer(serializers.Serializer):
    roles = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Role.objects.filter(scope=Role.Scope.PLATFORM).exclude(code="user"),
        required=False,
    )
    is_active = serializers.BooleanField(required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Supply roles or account status.")
        return attrs


class MembershipWriteSerializer(serializers.Serializer):
    roles = serializers.PrimaryKeyRelatedField(many=True, queryset=Role.objects.filter(scope=Role.Scope.GROUP))
    active = serializers.BooleanField(default=True)


class GroupMembershipSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source="user.get_full_name")
    username = serializers.CharField(source="user.username")

    class Meta:
        model = GroupMembership
        fields = ("id", "user", "user_name", "username", "roles", "active", "can_spend")


class SpendingPermissionSerializer(serializers.Serializer):
    can_spend = serializers.BooleanField()


class MentorshipSerializer(serializers.Serializer):
    professor = serializers.IntegerField(min_value=1)
    student = serializers.IntegerField(min_value=1)


class AuditSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.get_full_name", read_only=True)

    class Meta:
        model = AuditEvent
        fields = ("id", "actor", "actor_name", "action", "details", "created_at")
