from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"From {self.sender.get_full_name()} to {self.recipient.get_full_name()}: {self.subject}"
    
    def mark_as_read(self):
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class MessageThread(models.Model):
    class Route(models.TextChoices):
        LEGACY = "legacy", "Legacy conversation"
        SUPPORT_QUEUE = "support_queue", "Support queue"
        ADMIN_QUEUE = "admin_queue", "Administration queue"
        SUPPORT_DIRECT = "support_direct", "Support conversation"
        ADMIN_DIRECT = "admin_direct", "Administrator conversation"
        MENTOR = "mentor", "Mentorship conversation"

    class TicketStatus(models.TextChoices):
        OPEN = "open", "Open"
        WAITING = "waiting", "Waiting for requester"
        RESOLVED = "resolved", "Resolved"

    route = models.CharField(max_length=20, choices=Route.choices, default=Route.LEGACY)
    created_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="+")
    recipient = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="+")
    group = models.ForeignKey("user_management.UserGroup", null=True, on_delete=models.PROTECT)
    ticket_status = models.CharField(max_length=10, choices=TicketStatus.choices, null=True, blank=True)
    ticket_assignee = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    participants = models.ManyToManyField(User, related_name='message_threads')
    subject = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'message_threads'
        verbose_name = 'Message Thread'
        verbose_name_plural = 'Message Threads'
        ordering = ["-updated_at", "-pk"]
        indexes = [models.Index(fields=["route", "-updated_at"])]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(route="support_queue", ticket_status__isnull=False)
                    | (~models.Q(route="support_queue")
                       & models.Q(ticket_status__isnull=True, ticket_assignee__isnull=True))
                ),
                name="ticket_fields_match_support_route",
            ),
        ]
    
    def __str__(self):
        return self.subject
    
    @property
    def last_message(self):
        return self.thread_messages.order_by('-created_at').first()
    


class ThreadMessage(models.Model):
    forwarded = models.BooleanField(default=False)
    thread = models.ForeignKey(MessageThread, on_delete=models.CASCADE, related_name='thread_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thread_messages')
    reply_to = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'thread_messages'
        verbose_name = 'Thread Message'
        verbose_name_plural = 'Thread Messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.thread.subject} - {self.sender.get_full_name()}"
    
    def mark_as_read(self):
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('message', 'New Message'),
        ('project_update', 'Project Update'),
        ('credit_transaction', 'Credit Transaction'),
        ('system', 'System Notification'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"
    
    def mark_as_read(self):
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class ThreadReadReceipt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.ForeignKey(ThreadMessage, on_delete=models.CASCADE, related_name="receipts")
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "message"], name="unique_thread_read_receipt")
        ]
