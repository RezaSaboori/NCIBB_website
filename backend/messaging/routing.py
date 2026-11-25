from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Exists, OuterRef, Q, Subquery
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.user_management.access import is_admin, is_support, mentor_contacts
from apps.user_management.models import PlatformRoleAssignment
from .models import MessageThread, ThreadMessage, ThreadReadReceipt
from .recipient_search import matches_recipient, recipient_label, search_recipients
from .tickets import reopen_on_requester_reply, support_agents

Route = MessageThread.Route


def queue_users(code):
    return PlatformRoleAssignment.objects.filter(
        role__scope="platform", role__code=code, user__is_active=True
    ).values("user_id")


def readable_threads(user):
    support = is_support(user)
    admin = is_admin(user)
    allowed = Q(route=Route.LEGACY, participants=user)
    allowed |= Q(route__in=(Route.ADMIN_DIRECT, Route.SUPPORT_DIRECT), recipient=user)
    if admin:
        allowed |= Q(route=Route.ADMIN_DIRECT, created_by=user) | Q(route=Route.ADMIN_QUEUE)
    if support:
        allowed |= Q(route=Route.SUPPORT_DIRECT, created_by=user) | Q(route=Route.ADMIN_QUEUE, created_by=user)
        allowed |= Q(route=Route.SUPPORT_QUEUE)
    else:
        allowed |= Q(route=Route.SUPPORT_QUEUE, created_by=user)
    for peer_id, group_id in mentor_contacts(user):
        allowed |= Q(route=Route.MENTOR, group_id=group_id) & (
            Q(created_by=user, recipient_id=peer_id) | Q(created_by_id=peer_id, recipient=user)
        )
    return MessageThread.objects.filter(allowed).distinct()


def thread_list(user, *, include_ticket_owner=False):
    read = ThreadReadReceipt.objects.filter(user=user, message_id=OuterRef("pk"))
    messages = ThreadMessage.objects.filter(thread_id=OuterRef("pk"))
    latest = messages.order_by("-pk")
    unread = messages.exclude(sender=user).exclude(Exists(read)).order_by().values("thread_id")
    threads = readable_threads(user).select_related("created_by", "recipient", "group").annotate(
        unread=Subquery(unread.annotate(total=Count("pk")).values("total")[:1]),
        preview=Subquery(latest.values("content")[:1]),
        preview_sender=Subquery(latest.values("sender_id")[:1]),
        preview_created_at=Subquery(latest.values("created_at")[:1]),
    )
    if include_ticket_owner:
        threads = threads.select_related("ticket_assignee").annotate(
            ticket_has_owner=Exists(support_agents().filter(pk=OuterRef("ticket_assignee_id"))),
        )
    return threads


def unread_messages(user):
    read = ThreadReadReceipt.objects.filter(user=user, message_id=OuterRef("pk"))
    return ThreadMessage.objects.filter(thread__in=readable_threads(user)).exclude(sender=user).exclude(Exists(read))


def available_destinations(user, search=""):
    admin, support = is_admin(user), is_support(user)
    search = " ".join(search.split())
    term = search.casefold()
    result = []
    if not support and term in "پشتیبانی":
        result.append({"kind": "support_queue", "label": "پشتیبانی"})
    if support and term in "مدیریت":
        result.append({"kind": "admin_queue", "label": "مدیریت"})
    peers = get_user_model().objects.filter(is_active=True).exclude(pk=user.pk)
    if admin or support:
        if support and not admin:
            peers = peers.exclude(Q(is_superuser=True) | Q(pk__in=queue_users("admin")) | Q(pk__in=queue_users("support")))
        kind = "admin_direct" if admin else "support_direct"
        result.extend(
            {"kind": kind, "recipient": peer.pk, "label": recipient_label(peer)}
            for peer in search_recipients(peers, search).order_by("first_name", "last_name", "pk")[:25]
        )
    result.extend(
        {"kind": "mentor", "recipient": peer_id, "group": group_id, "label": recipient_label(peer)}
        for (peer_id, group_id), peer in mentor_contacts(user).items()
        if matches_recipient(peer, term)
    )
    return result


def validate_destination(user, kind, recipient_id=None, group_id=None):
    admin, support = is_admin(user), is_support(user)
    if kind in (Route.SUPPORT_QUEUE, Route.ADMIN_QUEUE):
        if recipient_id is not None or group_id is not None:
            raise ValidationError({"recipient": "A queue receives this conversation."})
        if (kind == Route.SUPPORT_QUEUE and not support) or (kind == Route.ADMIN_QUEUE and support):
            return None
        raise PermissionDenied()
    if kind not in (Route.MENTOR, Route.SUPPORT_DIRECT, Route.ADMIN_DIRECT) or not recipient_id or recipient_id == user.pk:
        raise PermissionDenied()
    recipient = get_user_model().objects.filter(pk=recipient_id, is_active=True).first()
    if recipient is None:
        raise PermissionDenied()
    if kind == Route.MENTOR and (recipient_id, group_id) in mentor_contacts(user):
        return recipient
    if group_id is not None:
        raise PermissionDenied()
    if kind == Route.ADMIN_DIRECT and admin:
        return recipient
    if kind == Route.SUPPORT_DIRECT and support and not is_admin(recipient) and not is_support(recipient):
        return recipient
    raise PermissionDenied()


def may_reply(thread):
    creator = thread.created_by
    if not creator or not creator.is_active or thread.route == Route.LEGACY:
        return False
    if thread.route == Route.ADMIN_DIRECT and not is_admin(creator):
        return False
    if thread.route in (Route.ADMIN_QUEUE, Route.SUPPORT_DIRECT) and not is_support(creator):
        return False
    return thread.recipient is None or thread.recipient.is_active


@transaction.atomic
def compose(user, *, kind, subject, content, recipient=None, group=None, forwarded=()):
    peer = validate_destination(user, kind, recipient, group)
    thread = MessageThread.objects.create(
        route=kind, subject=subject, created_by=user, recipient=peer, group_id=group,
        ticket_status=MessageThread.TicketStatus.OPEN if kind == Route.SUPPORT_QUEUE else None,
    )
    thread.participants.add(user)
    if peer:
        thread.participants.add(peer)
    if content:
        ThreadMessage.objects.create(thread=thread, sender=user, content=content)
    ThreadMessage.objects.bulk_create([
        ThreadMessage(thread=thread, sender=user, content=message.content, forwarded=True)
        for message in forwarded
    ])
    return thread


@transaction.atomic
def reply(user, thread_id, content, reply_to_id=None):
    thread = get_object_or_404(MessageThread.objects.select_for_update(), pk=thread_id)
    if not readable_threads(user).filter(pk=thread_id).exists():
        raise Http404
    if not may_reply(thread):
        raise PermissionDenied("This conversation is read-only.")
    original = None
    if reply_to_id is not None:
        original = thread.thread_messages.select_related("sender").filter(pk=reply_to_id).first()
        if original is None:
            raise ValidationError({"reply_to_id": "The quoted message is unavailable in this conversation."})
    message = ThreadMessage.objects.create(thread=thread, sender=user, content=content, reply_to=original)
    reopen_on_requester_reply(user, thread)
    thread.updated_at = timezone.now()
    thread.save(update_fields=["updated_at"])
    return message


def mark_read(user, messages):
    ThreadReadReceipt.objects.bulk_create(
        [ThreadReadReceipt(user=user, message_id=message_id)
         for message_id in messages.exclude(sender=user).values_list("pk", flat=True)],
        ignore_conflicts=True, batch_size=500,
    )
