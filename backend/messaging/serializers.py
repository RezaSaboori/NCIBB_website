from rest_framework import serializers

from .models import Message, MessageThread, Notification, ThreadMessage
from .routing import label, may_reply


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)
    recipient_name = serializers.CharField(source="recipient.get_full_name", read_only=True)

    class Meta:
        model = Message
        fields = ("id", "sender", "sender_name", "recipient", "recipient_name", "subject", "content",
                  "is_read", "created_at", "read_at")
        read_only_fields = fields


class ComposeSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=MessageThread.Route.choices[1:])
    recipient = serializers.IntegerField(min_value=1, required=False)
    group = serializers.IntegerField(min_value=1, required=False)
    subject = serializers.CharField(max_length=200)
    content = serializers.CharField(max_length=6000)


class ForwardSerializer(ComposeSerializer):
    content = serializers.CharField(max_length=6000, allow_blank=True, default="")
    message_ids = serializers.ListField(child=serializers.IntegerField(min_value=1), min_length=1, max_length=10)

    def validate_message_ids(self, ids):
        return list(dict.fromkeys(ids))


class ReplySerializer(serializers.Serializer):
    content = serializers.CharField(max_length=6000)


class LegacySendSerializer(ReplySerializer):
    recipient = serializers.IntegerField(min_value=1)
    subject = serializers.CharField(max_length=200)


class ThreadMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = ThreadMessage
        fields = ("id", "sender", "sender_name", "content", "forwarded", "created_at")
        read_only_fields = fields

    def get_sender_name(self, obj):
        return label(obj.sender)


class MessageThreadSerializer(serializers.ModelSerializer):
    counterpart = serializers.SerializerMethodField()
    can_reply = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()

    class Meta:
        model = MessageThread
        fields = ("id", "subject", "route", "counterpart", "can_reply", "unread_count",
                  "preview", "group", "created_at", "updated_at")
        read_only_fields = fields

    def get_counterpart(self, obj):
        user = self.context.get("subject") or self.context["request"].user
        if obj.route in (MessageThread.Route.SUPPORT_QUEUE, MessageThread.Route.ADMIN_QUEUE):
            if obj.created_by_id != user.pk:
                return label(obj.created_by)
            return "پشتیبانی" if obj.route == MessageThread.Route.SUPPORT_QUEUE else "مدیریت"
        return label(obj.recipient if obj.created_by_id == user.pk else obj.created_by)

    def get_can_reply(self, obj):
        return not self.context.get("review", False) and may_reply(obj)

    def get_unread_count(self, obj):
        return getattr(obj, "unread", None) or 0

    def get_preview(self, obj):
        return (getattr(obj, "preview", None) or "")[:180]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "notification_type", "title", "message", "is_read", "created_at", "read_at")
        read_only_fields = fields
