from rest_framework import serializers

from .models import Message, MessageThread, Notification, ThreadMessage
from .recipient_search import recipient_label
from .routing import may_reply


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


class MessageContentSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=6000)


class ReplySerializer(MessageContentSerializer):
    reply_to_id = serializers.IntegerField(min_value=1, required=False, allow_null=True)


class LegacySendSerializer(MessageContentSerializer):
    recipient = serializers.IntegerField(min_value=1)
    subject = serializers.CharField(max_length=200)


class TicketFilterSerializer(serializers.Serializer):
    ticket_status = serializers.ChoiceField(choices=MessageThread.TicketStatus.values, required=False)
    ticket_owner = serializers.ChoiceField(choices=("mine", "unassigned"), required=False)


class TicketUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=MessageThread.TicketStatus.values, required=False)
    assignee_id = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    expected_assignee_id = serializers.IntegerField(min_value=1, required=False, allow_null=True)

    def validate(self, data):
        has_assignee = "assignee_id" in data
        if has_assignee != ("expected_assignee_id" in data):
            raise serializers.ValidationError("Provide both assignee_id and expected_assignee_id to change ownership.")
        if not has_assignee and "status" not in data:
            raise serializers.ValidationError("Provide a status or an ownership change.")
        return data


class ThreadMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    reply_to = serializers.SerializerMethodField()
    read_by_other = serializers.BooleanField(read_only=True, allow_null=True)

    class Meta:
        model = ThreadMessage
        fields = ("id", "sender", "sender_name", "content", "forwarded", "created_at", "reply_to", "read_by_other")
        read_only_fields = fields

    def get_sender_name(self, obj):
        return recipient_label(obj.sender)

    def get_reply_to(self, obj):
        original = obj.reply_to
        if original is None or original.thread_id != obj.thread_id:
            return None
        return {
            "id": original.pk,
            "sender_name": recipient_label(original.sender),
            "excerpt": " ".join(original.content.split())[:180],
        }


class MessageThreadSerializer(serializers.ModelSerializer):
    counterpart = serializers.SerializerMethodField()
    can_reply = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()
    preview_sender = serializers.IntegerField(read_only=True, allow_null=True)
    preview_created_at = serializers.DateTimeField(read_only=True, allow_null=True)
    ticket = serializers.SerializerMethodField()

    class Meta:
        model = MessageThread
        fields = ("id", "subject", "route", "counterpart", "can_reply", "unread_count",
                  "preview", "preview_sender", "preview_created_at", "group", "created_at", "updated_at", "ticket")
        read_only_fields = fields

    def get_counterpart(self, obj):
        user = self.context.get("subject") or self.context["request"].user
        if obj.route in (MessageThread.Route.SUPPORT_QUEUE, MessageThread.Route.ADMIN_QUEUE):
            if obj.created_by_id != user.pk:
                return recipient_label(obj.created_by)
            return "پشتیبانی" if obj.route == MessageThread.Route.SUPPORT_QUEUE else "مدیریت"
        return recipient_label(obj.recipient if obj.created_by_id == user.pk else obj.created_by)

    def get_can_reply(self, obj):
        return not self.context.get("review", False) and may_reply(obj)

    def get_unread_count(self, obj):
        return getattr(obj, "unread", None) or 0

    def get_preview(self, obj):
        return (getattr(obj, "preview", None) or "")[:180]

    def get_ticket(self, obj):
        if obj.route != MessageThread.Route.SUPPORT_QUEUE:
            return None
        ticket = {"status": obj.ticket_status}
        if self.context.get("can_manage_tickets"):
            assignee = obj.ticket_assignee if getattr(obj, "ticket_has_owner", False) else None
            ticket["assignee"] = {"id": assignee.pk, "name": recipient_label(assignee)} if assignee else None
        return ticket


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "notification_type", "title", "message", "is_read", "created_at", "read_at")
        read_only_fields = fields
