from django.conf import settings
from django.db import models


class Role(models.Model):
    class Scope(models.TextChoices):
        PLATFORM = "platform", "Platform"
        GROUP = "group", "Group"

    code = models.SlugField(max_length=48)
    label = models.CharField(max_length=100)
    scope = models.CharField(max_length=10, choices=Scope.choices)
    capabilities = models.JSONField(default=list, blank=True)
    builtin = models.BooleanField(default=False)

    class Meta:
        ordering = ["scope", "code"]
        constraints = [
            models.UniqueConstraint(fields=["scope", "code"], name="unique_account_role")
        ]


class PlatformRoleAssignment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="platform_roles"
    )
    role = models.ForeignKey(Role, on_delete=models.PROTECT)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "role"], name="unique_platform_role_assignment")
        ]


class UserGroup(models.Model):
    name = models.CharField(max_length=150)
    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.PROTECT, related_name="children"
    )

    class Meta:
        ordering = ["name", "pk"]


class GroupMembership(models.Model):
    group = models.ForeignKey(UserGroup, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="group_memberships"
    )
    roles = models.ManyToManyField(Role)
    can_spend = models.BooleanField(default=False)
    active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["group", "user"], name="unique_user_group_membership")
        ]
        ordering = ["pk"]


class Mentorship(models.Model):
    professor = models.ForeignKey(
        GroupMembership, on_delete=models.CASCADE, related_name="mentored_students"
    )
    student = models.ForeignKey(
        GroupMembership, on_delete=models.CASCADE, related_name="assigned_professors"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["professor", "student"], name="unique_group_mentorship"),
            models.CheckConstraint(
                condition=~models.Q(professor=models.F("student")), name="different_mentorship_members"
            ),
        ]


class AuditEvent(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="+"
    )
    subject = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="account_audit"
    )
    action = models.CharField(max_length=64)
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-pk"]
        indexes = [models.Index(fields=["subject", "-created_at"])]


class EmailVerification(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    digest = models.CharField(max_length=64)
    email = models.EmailField()
    expires_at = models.DateTimeField()
    sent_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
