from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError

from apps.user_management.access import SUPPORT, audit, is_support
from apps.user_management.models import Role
from .models import MessageThread
from .recipient_search import recipient_label, search_recipients

TicketStatus = MessageThread.TicketStatus


class TicketOwnerConflict(APIException):
    status_code = 409
    default_detail = "Ticket ownership has changed. Reload the ticket and try again."
    default_code = "ticket_owner_conflict"


def support_agents():
    roles = Role.objects.filter(scope=Role.Scope.PLATFORM).values_list("pk", "capabilities")
    role_ids = [role_id for role_id, permissions in roles if SUPPORT in permissions]
    return get_user_model().objects.filter(
        is_active=True, platform_roles__role_id__in=role_ids,
    ).distinct()


def ticket_assignees(search):
    return [
        {"id": user.pk, "name": recipient_label(user)}
        for user in search_recipients(support_agents(), search).order_by("first_name", "last_name", "pk")[:25]
    ]


def audit_ticket_change(actor, ticket, **details):
    audit(actor, "support_ticket_updated", subject=ticket.created_by, thread_id=ticket.pk, **details)


@transaction.atomic
def update_ticket(actor, thread_id, changes):
    if not is_support(actor):
        raise PermissionDenied()
    ticket = get_object_or_404(
        MessageThread.objects.select_for_update(), pk=thread_id, route=MessageThread.Route.SUPPORT_QUEUE,
    )
    updates = {}
    audit_details = {}
    if "assignee_id" in changes:
        eligible = support_agents()
        before = ticket.ticket_assignee_id
        current = before if before and eligible.filter(pk=before).exists() else None
        if current != changes["expected_assignee_id"]:
            raise TicketOwnerConflict()
        after = changes["assignee_id"]
        if after is not None and not eligible.filter(pk=after).exists():
            raise ValidationError({"assignee_id": "Choose an active support agent."})
        if before != after:
            updates["ticket_assignee_id"] = after
            audit_details["assignee_id"] = {"from": before, "to": after}
    if "status" in changes and ticket.ticket_status != changes["status"]:
        updates["ticket_status"] = changes["status"]
        audit_details["status"] = {"from": ticket.ticket_status, "to": changes["status"]}
    if updates:
        MessageThread.objects.filter(pk=ticket.pk).update(**updates)
        audit_ticket_change(actor, ticket, **audit_details)


def reopen_on_requester_reply(actor, ticket):
    if actor.pk != ticket.created_by_id or ticket.ticket_status not in (TicketStatus.WAITING, TicketStatus.RESOLVED):
        return
    previous = ticket.ticket_status
    ticket.ticket_status = TicketStatus.OPEN
    ticket.save(update_fields=["ticket_status"])
    audit_ticket_change(actor, ticket, status={"from": previous, "to": TicketStatus.OPEN}, reason="requester_reply")
