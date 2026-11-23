from rest_framework.permissions import BasePermission

from .models import AuditEvent, GroupMembership, Mentorship, Role


ADMIN = "platform.admin"
SUPPORT = "messaging.support_queue"
GROUP_WALLET = "group.manage_wallet"
PUBLIC_CAPABILITIES = {"profile.research_groups": "گروه‌های پژوهشی"}
BASE_CAPABILITIES = frozenset({"profile.learning", "profile.projects"})
GROUP_CAPABILITIES = {"group.mentor": "ارتباط با دانشجویان", "group.student": "ارتباط با استاد"}


def platform_roles(user):
    return list(
        Role.objects.filter(scope=Role.Scope.PLATFORM, platformroleassignment__user=user)
        .order_by("code")
    )


def capabilities(user, roles=None):
    if not user.is_authenticated or not user.is_active:
        return set()
    roles = platform_roles(user) if roles is None else roles
    result = set(BASE_CAPABILITIES)
    for role in roles:
        result.update(role.capabilities)
    if user.is_superuser:
        result.add(ADMIN)
    return result


def is_admin(user):
    return ADMIN in capabilities(user)


def is_support(user):
    return SUPPORT in capabilities(user)


def role_summary(role):
    return {"id": role.pk, "code": role.code, "label": role.label}


def group_summary(membership):
    roles = list(membership.roles.all())
    return {
        "id": membership.group_id,
        "membership_id": membership.pk,
        "name": membership.group.name,
        "parent_id": membership.group.parent_id,
        "roles": [role_summary(role) for role in roles],
        "can_spend": membership.can_spend,
        "can_manage_wallet": any(GROUP_WALLET in role.capabilities for role in roles),
    }


def current_access(user):
    roles = platform_roles(user)
    role_data = [role_summary(role) for role in roles]
    if not any(role.code == "user" for role in roles):
        role_data.insert(0, {"id": None, "code": "user", "label": "کاربر"})
    if user.is_superuser and not any(role.code == "admin" for role in roles):
        role_data.append({"id": None, "code": "admin", "label": "مدیر سامانه"})
    groups = GroupMembership.objects.filter(user=user, active=True)
    return {
        "roles": role_data,
        "capabilities": sorted(capabilities(user, roles)),
        "groups": [group_summary(group) for group in groups.select_related("group").prefetch_related("roles")],
    }


def audit(actor, action, *, subject=None, **details):
    return AuditEvent.objects.create(actor=actor, action=action, subject=subject, details=details)


class IsPlatformAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


def group_manager(membership):
    return membership.active and any(
        GROUP_WALLET in role.capabilities for role in membership.roles.all()
    )


def mentor_contacts(user):
    connections = Mentorship.objects.filter(
        professor__active=True, professor__user__is_active=True,
        student__active=True, student__user__is_active=True,
    ).select_related("professor__user", "student__user").prefetch_related(
        "professor__roles", "student__roles"
    )
    contacts = {}
    for connection in connections.filter(professor__user=user) | connections.filter(student__user=user):
        professor, student = connection.professor, connection.student
        if professor.group_id != student.group_id:
            continue
        if not any("group.mentor" in role.capabilities for role in professor.roles.all()):
            continue
        if not any("group.student" in role.capabilities for role in student.roles.all()):
            continue
        peer = student.user if professor.user_id == user.pk else professor.user
        contacts[peer.pk, professor.group_id] = peer
    return contacts
