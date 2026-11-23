from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.cache import add_never_cache_headers
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from credits.models import CreditTransaction
from credits.serializers import AdjustmentSerializer, CreditTransactionSerializer
from credits.services import CreditError, adjust_balance
from credits.views import credit_error, wallet_summary
from datasaz.models import DatasazProject
from messaging.models import MessageThread, ThreadMessage
from messaging.serializers import MessageThreadSerializer, ThreadMessageSerializer
from projects.models import Project

from .access import GROUP_CAPABILITIES, PUBLIC_CAPABILITIES, IsPlatformAdmin, audit, is_admin
from .models import AuditEvent, PlatformRoleAssignment, Role
from .serializers import AccountAccessSerializer, AuditSerializer, RoleSerializer, UserDirectorySerializer

User = get_user_model()


def directory():
    return User.objects.select_related("credits").prefetch_related(
        "platform_roles__role", "group_memberships__group", "group_memberships__roles",
    ).order_by("-created_at", "-pk")


class AdminView(generics.GenericAPIView):
    permission_classes = [IsPlatformAdmin]

    def paginate(self, items, serializer_class, **context):
        page = self.paginate_queryset(items)
        serializer = serializer_class(page, many=True, context={**self.get_serializer_context(), **context})
        return self.get_paginated_response(serializer.data)


class UsersView(generics.ListAPIView):
    permission_classes = [IsPlatformAdmin]
    serializer_class = UserDirectorySerializer
    search_fields = ("username", "email", "first_name", "last_name")
    filterset_fields = ("is_active", "is_email_verified")
    ordering_fields = ("created_at", "last_login", "username")

    def get_queryset(self):
        queryset = directory()
        role = self.request.query_params.get("role")
        if role and role != "user":
            assigned = Q(platform_roles__role__scope=Role.Scope.PLATFORM, platform_roles__role__code=role)
            if role == "admin":
                assigned |= Q(is_superuser=True)
            queryset = queryset.filter(assigned).distinct()
        return queryset


class UserDetailView(AdminView):
    def get(self, request, pk):
        user = get_object_or_404(directory(), pk=pk)
        data = UserDirectorySerializer(user).data
        profile = getattr(user, "profile", None)
        data["profile"] = {
            "job_title": profile.job_title if profile else "",
            "company": profile.company if profile else "",
            "department": profile.department if profile else "",
        }
        data["wallet"] = wallet_summary(user, include_groups=False)
        data["balance"] = data["wallet"]["balance"]
        response = Response(data)
        add_never_cache_headers(response)
        return response


class UserAccessView(AdminView):
    @transaction.atomic
    def patch(self, request, pk):
        serializer = AccountAccessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        admin_role = Role.objects.select_for_update().get(scope=Role.Scope.PLATFORM, code="admin")
        actor = User.objects.get(pk=request.user.pk)
        if not is_admin(actor):
            raise PermissionDenied()
        user = get_object_or_404(User.objects.select_for_update(), pk=pk)
        assignments = PlatformRoleAssignment.objects.filter(user=user)
        old_roles = set(assignments.values_list("role_id", flat=True))
        new_roles = {role.pk for role in values["roles"]} if "roles" in values else old_roles
        active = values.get("is_active", user.is_active)
        if user.is_superuser and not actor.is_superuser:
            raise PermissionDenied()
        if is_admin(user) and (not active or not (user.is_superuser or admin_role.pk in new_roles)):
            another_admin = User.objects.filter(is_active=True).exclude(pk=user.pk).filter(
                Q(is_superuser=True) | Q(platform_roles__role=admin_role)
            ).exists()
            if not another_admin:
                raise ValidationError({"detail": "At least one active platform administrator is required."})
        if new_roles != old_roles:
            assignments.exclude(role_id__in=new_roles).delete()
            PlatformRoleAssignment.objects.bulk_create([
                PlatformRoleAssignment(user=user, role_id=role_id) for role_id in new_roles - old_roles
            ])
            audit(actor, "roles_changed", subject=user, before=sorted(old_roles), after=sorted(new_roles))
        if active != user.is_active:
            user.is_active = active
            user.save(update_fields=["is_active", "updated_at"])
            audit(actor, "account_status_changed", subject=user, active=active)
        return Response(UserDirectorySerializer(directory().get(pk=pk)).data)


class UserProjectsView(AdminView):
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        from django.db.models import CharField, F, Value

        datasaz = DatasazProject.objects.filter(owner=user).order_by().annotate(
            service=Value("datasaz", output_field=CharField()),
        ).values("pk", "name", "status", "service", "updated_at")
        other = Project.objects.filter(owner=user).order_by().annotate(
            name=F("title"), service=Value("project", output_field=CharField()),
        ).values("pk", "name", "status", "service", "updated_at")
        page = self.paginate_queryset(datasaz.union(other, all=True).order_by("-updated_at", "service", "pk"))
        return self.get_paginated_response(page)


class UserConversationsView(AdminView):
    @staticmethod
    def related(user):
        return MessageThread.objects.filter(
            Q(participants=user) | Q(thread_messages__sender=user)
        ).distinct().select_related("created_by", "recipient")

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return self.paginate(self.related(user), MessageThreadSerializer, review=True, subject=user)


class UserConversationMessagesView(UserConversationsView):
    def get(self, request, pk, thread_id):
        user = get_object_or_404(User, pk=pk)
        thread = get_object_or_404(self.related(user), pk=thread_id)
        audit(request.user, "conversation_reviewed", subject=user, thread_id=thread.pk)
        return self.paginate(
            ThreadMessage.objects.filter(thread=thread).select_related("sender").order_by("-pk"),
            ThreadMessageSerializer,
        )


class UserCreditHistoryView(AdminView):
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return self.paginate(CreditTransaction.objects.filter(user=user), CreditTransactionSerializer)

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = AdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            entry = adjust_balance(request.user, user=user, **serializer.validated_data)
        except CreditError as error:
            return credit_error(error)
        return Response(CreditTransactionSerializer(entry).data, status=status.HTTP_201_CREATED)


class UserAuditView(AdminView):
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return self.paginate(AuditEvent.objects.filter(subject=user).select_related("actor"), AuditSerializer)


class RoleListView(generics.ListCreateAPIView):
    permission_classes = [IsPlatformAdmin]
    serializer_class = RoleSerializer
    queryset = Role.objects.all()
    filterset_fields = ["scope"]
    search_fields = ["label", "code"]

    @transaction.atomic
    def perform_create(self, serializer):
        role = serializer.save()
        audit(self.request.user, "role_created", role=role.code, scope=role.scope)


class RoleDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsPlatformAdmin]
    serializer_class = RoleSerializer
    queryset = Role.objects.all()
    http_method_names = ["get", "patch", "head", "options"]

    @transaction.atomic
    def perform_update(self, serializer):
        if serializer.instance.builtin:
            raise PermissionDenied("Built-in roles are protected.")
        role = serializer.save()
        audit(self.request.user, "role_updated", role=role.code, scope=role.scope, capabilities=role.capabilities)


class PermissionCatalogView(AdminView):
    def get(self, request):
        return Response({"platform": PUBLIC_CAPABILITIES, "group": GROUP_CAPABILITIES})
