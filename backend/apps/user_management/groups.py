from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from credits.models import CreditTransaction, GroupWallet
from credits.serializers import AdjustmentSerializer, CreditTransactionSerializer
from credits.services import CreditError, adjust_balance
from credits.views import credit_error

from .access import IsPlatformAdmin, audit, group_manager, is_admin
from .models import GroupMembership, Mentorship, Role, UserGroup
from .serializers import (
    GroupMembershipSerializer, MembershipWriteSerializer, MentorshipSerializer,
    SpendingPermissionSerializer, UserGroupSerializer,
)


class GroupsView(generics.ListCreateAPIView):
    serializer_class = UserGroupSerializer
    search_fields = ("name",)

    def get_queryset(self):
        if is_admin(self.request.user):
            return UserGroup.objects.all()
        return UserGroup.objects.filter(memberships__user=self.request.user, memberships__active=True)

    @transaction.atomic
    def perform_create(self, serializer):
        if not is_admin(self.request.user):
            raise PermissionDenied()
        group = serializer.save()
        GroupWallet.objects.create(group=group)
        audit(self.request.user, "group_created", group=group.pk, parent=group.parent_id)


class GroupDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserGroupSerializer
    permission_classes = [IsPlatformAdmin]
    http_method_names = ["get", "patch", "head", "options"]
    queryset = UserGroup.objects.all()

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        # Serialize hierarchy edits so concurrent changes cannot create a parent cycle.
        Role.objects.select_for_update().get(scope="group", code="group-admin")
        return super().patch(request, *args, **kwargs)

    def perform_update(self, serializer):
        group = serializer.save()
        audit(self.request.user, "group_updated", group=group.pk, parent=group.parent_id)


def group_access(request, pk):
    group = get_object_or_404(UserGroup, pk=pk)
    member = GroupMembership.objects.filter(group=group, user=request.user, active=True).prefetch_related("roles").first()
    if is_admin(request.user) or (member and group_manager(member)):
        return group
    raise PermissionDenied()


class GroupMembersView(generics.ListAPIView):
    serializer_class = GroupMembershipSerializer
    search_fields = ("user__username", "user__first_name", "user__last_name")

    def get_queryset(self):
        group = group_access(self.request, self.kwargs["pk"])
        return group.memberships.select_related("user").prefetch_related("roles")


class GroupMembershipView(generics.GenericAPIView):
    permission_classes = [IsPlatformAdmin]

    @transaction.atomic
    def put(self, request, pk, user_id):
        group = get_object_or_404(UserGroup.objects.select_for_update(), pk=pk)
        user = get_object_or_404(get_user_model(), pk=user_id)
        serializer = MembershipWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership, _ = GroupMembership.objects.select_for_update().get_or_create(group=group, user=user)
        membership.active = serializer.validated_data["active"]
        if not membership.active:
            membership.can_spend = False
        membership.save(update_fields=["active", "can_spend"])
        membership.roles.set(serializer.validated_data["roles"])
        audit(request.user, "group_membership_changed", subject=user, group=group.pk,
              roles=list(membership.roles.values_list("code", flat=True)), active=membership.active)
        return Response(GroupMembershipSerializer(membership).data)


class GroupSpendingView(generics.GenericAPIView):
    @transaction.atomic
    def patch(self, request, pk, membership_id):
        get_object_or_404(UserGroup.objects.select_for_update(), pk=pk)
        group = group_access(request, pk)
        membership = get_object_or_404(
            GroupMembership.objects.select_for_update(), pk=membership_id, group=group, active=True,
        )
        serializer = SpendingPermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership.can_spend = serializer.validated_data["can_spend"]
        membership.save(update_fields=["can_spend"])
        audit(request.user, "group_spending_changed", subject=membership.user,
              group=group.pk, can_spend=membership.can_spend)
        return Response(GroupMembershipSerializer(membership).data)


class GroupWalletView(generics.ListAPIView):
    serializer_class = CreditTransactionSerializer

    def get_queryset(self):
        group = group_access(self.request, self.kwargs["pk"])
        return CreditTransaction.objects.filter(group=group)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        wallet = GroupWallet.objects.filter(group_id=kwargs["pk"]).first()
        response.data["balance"] = str(wallet.balance) if wallet else "0.00"
        return response

    def post(self, request, pk):
        if not is_admin(request.user):
            raise PermissionDenied()
        group = get_object_or_404(UserGroup, pk=pk)
        serializer = AdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            entry = adjust_balance(request.user, group=group, **serializer.validated_data)
        except CreditError as error:
            return credit_error(error)
        return Response(CreditTransactionSerializer(entry).data, status=status.HTTP_201_CREATED)


class GroupMentorsView(generics.GenericAPIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request, pk):
        get_object_or_404(UserGroup, pk=pk)
        links = Mentorship.objects.filter(professor__group_id=pk, student__group_id=pk)
        return Response([
            {"id": item.pk, "professor": item.professor_id, "student": item.student_id,
             "professor_name": item.professor.user.get_full_name() or item.professor.user.username,
             "student_name": item.student.user.get_full_name() or item.student.user.username}
            for item in links.select_related("professor__user", "student__user")
        ])

    @transaction.atomic
    def post(self, request, pk):
        group = get_object_or_404(UserGroup.objects.select_for_update(), pk=pk)
        serializer = MentorshipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        members = group.memberships.filter(active=True, user__is_active=True).prefetch_related("roles")
        professor = get_object_or_404(members, pk=serializer.validated_data["professor"])
        student = get_object_or_404(members, pk=serializer.validated_data["student"])
        if professor == student:
            raise ValidationError("Select two different members.")
        for member, capability in ((professor, "group.mentor"), (student, "group.student")):
            if not any(capability in role.capabilities for role in member.roles.all()):
                raise ValidationError("The selected members need professor and student permissions.")
        link, created = Mentorship.objects.get_or_create(professor=professor, student=student)
        if created:
            audit(request.user, "mentor_assigned", subject=student.user, professor=professor.user_id, group=group.pk)
        return Response({"id": link.pk, "professor": professor.pk, "student": student.pk}, status=201 if created else 200)

    @transaction.atomic
    def delete(self, request, pk, link_id):
        get_object_or_404(UserGroup.objects.select_for_update(), pk=pk)
        link = get_object_or_404(Mentorship, pk=link_id, professor__group_id=pk, student__group_id=pk)
        audit(request.user, "mentor_removed", subject=link.student.user,
              professor=link.professor.user_id, group=pk)
        link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResearchGroupsView(generics.GenericAPIView):
    def get(self, request):
        from .access import capabilities, group_summary, mentor_contacts

        if "profile.research_groups" not in capabilities(request.user):
            raise PermissionDenied()
        contacts = mentor_contacts(request.user)
        memberships = GroupMembership.objects.filter(user=request.user, active=True).select_related("group").prefetch_related("roles")
        return Response([
            {
                **group_summary(member),
                "contacts": [
                    {"id": peer_id, "name": peer.get_full_name() or peer.username}
                    for (peer_id, group_id), peer in contacts.items() if group_id == member.group_id
                ],
            }
            for member in memberships
        ])
