from django.db import migrations


def preserve_history(apps, schema_editor):
    Message = apps.get_model("messaging", "Message")
    Thread = apps.get_model("messaging", "MessageThread")
    Entry = apps.get_model("messaging", "ThreadMessage")
    Receipt = apps.get_model("messaging", "ThreadReadReceipt")

    for thread in Thread.objects.iterator(chunk_size=200):
        members = list(thread.participants.values_list("pk", flat=True))
        if len(members) == 2:
            creator = Entry.objects.filter(thread=thread, sender_id__in=members).order_by("pk").first()
            if creator:
                other = next(member for member in members if member != creator.sender_id)
                Thread.objects.filter(pk=thread.pk).update(created_by_id=creator.sender_id, recipient_id=other)
            for message in Entry.objects.filter(thread=thread, is_read=True, sender_id__in=members):
                Receipt.objects.get_or_create(
                    message=message, user_id=next(member for member in members if member != message.sender_id),
                )

    for message in Message.objects.iterator(chunk_size=500):
        thread = Thread.objects.create(
            subject=message.subject, created_by_id=message.sender_id, recipient_id=message.recipient_id,
        )
        Thread.objects.filter(pk=thread.pk).update(created_at=message.created_at, updated_at=message.created_at)
        thread.participants.add(message.sender_id, message.recipient_id)
        entry = Entry.objects.create(thread=thread, sender_id=message.sender_id, content=message.content)
        Entry.objects.filter(pk=entry.pk).update(created_at=message.created_at)
        if message.is_read:
            Receipt.objects.create(message=entry, user_id=message.recipient_id)


class Migration(migrations.Migration):
    dependencies = [("messaging", "0002_threadreadreceipt_alter_messagethread_options_and_more")]
    operations = [migrations.RunPython(preserve_history)]
