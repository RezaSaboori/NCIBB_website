from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, serializers, status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from apps.user_management.access import is_admin, is_support
from .models import Message, MessageThread, Notification, ThreadMessage
from .routing import (
    available_destinations, compose, mark_read, readable_threads, reply, thread_list, unread_messages,
)
from .serializers import (
    ComposeSerializer, ForwardSerializer, LegacySendSerializer, MessageSerializer,
    MessageThreadSerializer, NotificationSerializer, ReplySerializer, ThreadMessageSerializer,
)


class MessageWriteThrottle(UserRateThrottle):
    rate = "120/hour"
    scope = "message_write"

    def allow_request(self, request, view):
        return request.method in ("GET", "HEAD", "OPTIONS") or super().allow_request(request, view)


def own_legacy_messages(user):
    return Message.objects.filter(Q(sender=user) | Q(recipient=user)).select_related("sender", "recipient")


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    throttle_classes = [MessageWriteThrottle]
    filterset_fields = ["is_read", "sender", "recipient"]
    search_fields = ["subject", "content"]

    def get_queryset(self):
        return own_legacy_messages(self.request.user)

    def post(self, request, *args, **kwargs):
        return send_legacy(request)


class MessageDetailView(generics.RetrieveAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        return own_legacy_messages(self.request.user)


class MessageThreadListView(generics.ListAPIView):
    serializer_class = MessageThreadSerializer
    throttle_classes = [MessageWriteThrottle]
    filterset_fields = ["route"]
    search_fields = ["subject"]
    ordering_fields = ["updated_at", "created_at"]

    def get_queryset(self):
        return thread_list(self.request.user)

    def post(self, request):
        serializer = ComposeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        thread = compose(request.user, **serializer.validated_data)
        return Response(self.get_serializer(thread).data, status=status.HTTP_201_CREATED)


class MessageThreadDetailView(generics.RetrieveAPIView):
    serializer_class = MessageThreadSerializer

    def get_queryset(self):
        return thread_list(self.request.user)


class ThreadMessageListView(generics.ListAPIView):
    serializer_class = ThreadMessageSerializer
    throttle_classes = [MessageWriteThrottle]
    ordering_fields = ["id"]

    def get_queryset(self):
        thread = get_object_or_404(readable_threads(self.request.user), pk=self.kwargs["thread_id"])
        return ThreadMessage.objects.filter(thread=thread).select_related("sender").order_by("-pk")

    def post(self, request, thread_id):
        serializer = ReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = reply(request.user, thread_id, serializer.validated_data["content"])
        return Response(self.get_serializer(entry).data, status=status.HTTP_201_CREATED)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    filterset_fields = ["notification_type", "is_read"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationDetailView(generics.RetrieveAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get(self, request, *args, **kwargs):
        item = self.get_object()
        item.mark_as_read()
        return Response(self.get_serializer(item).data)


@api_view(["GET"])
def destinations_view(request):
    return Response(available_destinations(request.user, request.query_params.get("search", "").strip()[:120]))


@api_view(["POST"])
@throttle_classes([MessageWriteThrottle])
def forward_view(request, thread_id):
    source = get_object_or_404(readable_threads(request.user), pk=thread_id)
    serializer = ForwardSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    ids = serializer.validated_data.pop("message_ids")
    messages = list(source.thread_messages.filter(pk__in=ids).order_by("pk"))
    if len(messages) != len(ids):
        raise NotFound("A selected message is unavailable.")
    thread = compose(request.user, **serializer.validated_data, forwarded=messages)
    return Response(MessageThreadSerializer(thread, context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def mark_thread_read_view(request, thread_id):
    thread = get_object_or_404(readable_threads(request.user), pk=thread_id)
    marker = serializers.IntegerField(min_value=1).run_validation(request.data.get("through"))
    get_object_or_404(thread.thread_messages, pk=marker)
    mark_read(request.user, thread.thread_messages.filter(pk__lte=marker))
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def inbox_view(request):
    data = message_stats(request.user)
    data["recent_messages"] = MessageThreadSerializer(
        thread_list(request.user)[:5], context={"request": request}, many=True,
    ).data
    data["recent_notifications"] = NotificationSerializer(
        Notification.objects.filter(user=request.user)[:5], many=True,
    ).data
    return Response(data)


@api_view(["POST"])
def mark_all_read_view(request):
    mark_read(request.user, unread_messages(request.user))
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True, read_at=timezone.now())
    return Response(status=status.HTTP_204_NO_CONTENT)


def send_legacy(request):
    serializer = LegacySendSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    values = serializer.validated_data
    recipient = get_user_model().objects.filter(pk=values["recipient"], is_active=True).first()
    if not recipient or recipient.pk == request.user.pk:
        raise PermissionDenied()
    if is_admin(request.user):
        kind = MessageThread.Route.ADMIN_DIRECT
    elif is_support(request.user):
        if is_admin(recipient):
            kind = MessageThread.Route.ADMIN_QUEUE
            values.pop("recipient")
        else:
            kind = MessageThread.Route.SUPPORT_DIRECT
    elif is_support(recipient):
        kind = MessageThread.Route.SUPPORT_QUEUE
        values.pop("recipient")
    else:
        raise PermissionDenied()
    thread = compose(request.user, kind=kind, **values)
    return Response(MessageThreadSerializer(thread, context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@throttle_classes([MessageWriteThrottle])
def send_message_view(request):
    return send_legacy(request)


def message_stats(user):
    threads = readable_threads(user)
    unread = unread_messages(user).count()
    return {
        "total_sent": ThreadMessage.objects.filter(sender=user, thread__in=threads).count(),
        "total_received": ThreadMessage.objects.filter(thread__in=threads).exclude(sender=user).count(),
        "unread_messages": unread, "unread_count": unread,
        "unread_notifications": Notification.objects.filter(user=user, is_read=False).count(),
    }


@api_view(["GET"])
def message_stats_view(request):
    return Response(message_stats(request.user))
