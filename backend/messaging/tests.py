from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from unittest import skipUnless

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import connection, connections
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase
from rest_framework.test import APITestCase

from apps.user_management.models import AuditEvent, PlatformRoleAssignment, Role
from .models import MessageThread, ThreadMessage
from .routing import compose
from .tickets import TicketOwnerConflict, update_ticket


class MessagingWorkflowTests(APITestCase):
    threads = "/api/messaging/threads/"
    destinations = "/api/messaging/destinations/"
    assignees = "/api/messaging/ticket-assignees/"

    def setUp(self):
        cache.clear()
        self.user = self.account("requester")
        self.other = self.account("other")
        self.support = self.account("first-support", "support")
        self.second_support = self.account("second-support", "support")
        self.admin = self.account("admin", "admin")

    def account(self, name, role=None):
        user = get_user_model().objects.create_user(username=name, email=f"{name}@example.test")
        if role:
            PlatformRoleAssignment.objects.create(user=user, role=Role.objects.get(scope="platform", code=role))
        return user

    def compose(self, user, kind, **extra):
        self.client.force_authenticate(user)
        response = self.client.post(
            self.threads, {"kind": kind, "subject": "Question", "content": "Original message", **extra}, format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        return response.data

    def test_shared_support_destination_creates_tickets_and_staff_routes_create_messages(self):
        support = self.compose(self.user, "support_queue")
        self.assertEqual(support["ticket"], {"status": "open"})
        shared_from_admin = self.compose(self.admin, "support_queue")
        self.assertEqual(shared_from_admin["ticket"], {"status": "open"})
        direct = self.compose(self.admin, "admin_direct", recipient=self.support.pk)
        self.assertIsNone(direct["ticket"])
        message_id = self.client.get(f"{self.threads}{direct['id']}/messages/").data["results"][0]["id"]
        forwarded = self.client.post(f"{self.threads}{direct['id']}/forward/", {
            "kind": "support_queue", "subject": "Forwarded ticket", "message_ids": [message_id],
        }, format="json")
        self.assertEqual(forwarded.status_code, 201, forwarded.data)
        self.assertEqual(forwarded.data["ticket"], {"status": "open"})
        management = self.compose(self.support, "admin_queue")
        self.assertIsNone(management["ticket"])

        self.client.force_authenticate(self.user)
        legacy = self.client.post("/api/messaging/send/", {
            "recipient": self.support.pk, "subject": "Legacy send", "content": "Help",
        }, format="json")
        self.assertEqual(legacy.status_code, 201, legacy.data)
        self.assertEqual(legacy.data["ticket"], {"status": "open"})

    def test_ticket_assignment_status_and_filters_respect_support_capability(self):
        thread = self.compose(self.user, "support_queue")["id"]
        path = f"{self.threads}{thread}/ticket/"
        status = {"status": "waiting"}
        self.assertEqual(self.client.patch(path, status, format="json").status_code, 403)
        self.assertEqual(self.client.get(self.assignees).status_code, 403)
        self.assertEqual(self.client.get(self.threads, {"ticket_status": "open"}).status_code, 403)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.patch(path, status, format="json").status_code, 403)

        self.client.force_authenticate(self.support)
        destination = self.client.get(self.assignees, {"search": "second"}).data
        self.assertEqual(destination, [{"id": self.second_support.id, "name": self.second_support.username}])
        self.assertEqual(self.client.patch(path, {"assignee_id": self.support.id}, format="json").status_code, 400)
        claim = {"assignee_id": self.support.id, "expected_assignee_id": None}
        rejected = self.client.patch(path, {**claim, "assignee_id": self.user.id}, format="json")
        self.assertEqual(rejected.status_code, 400)
        claimed = self.client.patch(path, {**status, **claim}, format="json")
        self.assertEqual(claimed.status_code, 200, claimed.data)
        self.assertEqual(claimed.data["ticket"]["assignee"]["id"], self.support.id)
        self.assertEqual(claimed.data["ticket"]["status"], "waiting")
        self.assertEqual(self.client.get(self.threads, {"ticket_owner": "mine", "ticket_status": "waiting"}).data["count"], 1)
        self.assertEqual(self.client.get(self.threads, {"ticket_owner": "unassigned"}).data["count"], 0)
        self.assertTrue(AuditEvent.objects.filter(actor=self.support, subject=self.user, action="support_ticket_updated").exists())

        self.client.force_authenticate(self.second_support)
        conflict = self.client.patch(path, {**claim, "assignee_id": self.second_support.id}, format="json")
        self.assertEqual(conflict.status_code, 409)
        PlatformRoleAssignment.objects.filter(user=self.support).delete()
        self.assertEqual(self.client.get(self.threads, {"ticket_owner": "unassigned"}).data["count"], 1)
        self.assertIsNone(self.client.get(f"{self.threads}{thread}/").data["ticket"]["assignee"])
        self.assertEqual(
            self.client.patch(path, {**claim, "assignee_id": self.second_support.id}, format="json").status_code, 200,
        )
        self.assertEqual(
            self.client.patch(path, {"assignee_id": None, "expected_assignee_id": self.second_support.id}, format="json").status_code,
            200,
        )

        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get(f"{self.threads}{thread}/").data["ticket"], {"status": "waiting"})

    def test_replies_keep_context_across_pages_and_reopen_tickets(self):
        thread = self.compose(self.user, "support_queue")["id"]
        messages = f"{self.threads}{thread}/messages/"
        quote = ThreadMessage.objects.get(thread_id=thread)
        quote.content = "long\n" + "x" * 240
        quote.save(update_fields=["content"])
        ThreadMessage.objects.bulk_create(
            [ThreadMessage(thread_id=thread, sender=self.user, content="History") for _ in range(20)],
        )
        unrelated = self.compose(self.other, "support_queue")["id"]
        unrelated_message = ThreadMessage.objects.get(thread_id=unrelated)
        self.assertEqual(self.client.post(messages, {"content": "Test", "reply_to_id": quote.pk}, format="json").status_code, 404)

        self.client.force_authenticate(self.support)
        self.assertEqual(self.client.patch(f"{self.threads}{thread}/ticket/", {"status": "resolved"}, format="json").status_code, 200)
        ordinary = self.client.post(messages, {"content": "Resolved by staff."}, format="json")
        self.assertEqual(ordinary.status_code, 201)
        self.assertIsNone(ordinary.data["reply_to"])
        self.assertEqual(self.client.get(f"{self.threads}{thread}/").data["ticket"]["status"], "resolved")

        self.client.force_authenticate(self.user)
        for invalid in (unrelated_message.pk, 99999):
            response = self.client.post(messages, {"content": "Test", "reply_to_id": invalid}, format="json")
            self.assertEqual(response.status_code, 400)
            self.assertIn("reply_to_id", response.data)
        self.assertEqual(self.client.get(f"{self.threads}{thread}/").data["ticket"]["status"], "resolved")
        response = self.client.post(messages, {"content": "This still happens.", "reply_to_id": quote.pk}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["reply_to"], {"id": quote.pk, "sender_name": self.user.username, "excerpt": "long " + "x" * 175})
        page = self.client.get(messages).data["results"]
        self.assertNotIn(quote.pk, [message["id"] for message in page])
        self.assertEqual(page[0]["reply_to"], response.data["reply_to"])
        self.assertEqual(self.client.get(f"{self.threads}{thread}/").data["ticket"]["status"], "open")
        audit = AuditEvent.objects.filter(actor=self.user, action="support_ticket_updated").first()
        self.assertEqual(audit.details["reason"], "requester_reply")

        self.client.force_authenticate(self.support)
        self.assertEqual(self.client.patch(f"{self.threads}{thread}/ticket/", {"status": "waiting"}, format="json").status_code, 200)
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.post(messages, {"content": "Following up."}, format="json").status_code, 201)
        self.assertEqual(self.client.get(f"{self.threads}{thread}/").data["ticket"]["status"], "open")

        self.client.force_authenticate(self.support)
        forwarded = self.client.post(f"{self.threads}{thread}/forward/", {
            "kind": "admin_queue", "subject": "Forwarded", "message_ids": [response.data["id"]],
        }, format="json")
        self.assertEqual(forwarded.status_code, 201, forwarded.data)
        copied = self.client.get(f"{self.threads}{forwarded.data['id']}/messages/").data["results"][0]
        self.assertTrue(copied["forwarded"])
        self.assertIsNone(copied["reply_to"])

        self.client.force_authenticate(self.admin)
        review = self.client.get(f"/api/auth/users/{self.user.pk}/conversations/{thread}/")
        reviewed = next(item for item in review.data["results"] if item["id"] == response.data["id"])
        self.assertEqual(reviewed["reply_to"], response.data["reply_to"])

    def test_recipient_search_matches_full_names_beyond_the_default_window(self):
        user_model = get_user_model()
        user_model.objects.bulk_create([
            user_model(username=f"person-{index}", email=f"person-{index}@example.test", first_name="Amina")
            for index in range(30)
        ])
        peer = self.account("last-person")
        peer.first_name, peer.last_name = "رضا", "نمونه"
        peer.save(update_fields=["first_name", "last_name"])
        self.client.force_authenticate(self.admin)
        first_page = self.client.get(self.destinations).data
        self.assertNotIn(peer.id, [item.get("recipient") for item in first_page])
        for search in ("رضا نمونه", "last-person"):
            result = self.client.get(self.destinations, {"search": search})
            self.assertEqual([item["recipient"] for item in result.data], [peer.id])
        self.assertEqual(self.client.get(self.destinations, {"search": "پشتیبانی"}).data, [
            {"kind": "support_queue", "label": "پشتیبانی"},
        ])

    def test_preview_and_delivery_use_actual_sender_and_other_reader(self):
        thread = self.compose(self.user, "support_queue")["id"]
        path = f"{self.threads}{thread}/"
        messages = f"{path}messages/"
        original = self.client.get(messages).data["results"][0]
        self.assertIs(original["read_by_other"], False)
        self.client.post(f"{path}read/", {"through": original["id"]}, format="json")
        self.assertIs(self.client.get(messages).data["results"][0]["read_by_other"], False)

        self.client.force_authenticate(self.support)
        self.assertIsNone(self.client.get(messages).data["results"][0]["read_by_other"])
        self.assertEqual(
            self.client.post(f"{path}read/", {"through": original["id"]}, format="json").status_code, 204,
        )
        response = self.client.post(messages, {"content": "A newer reply"}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertIs(response.data["read_by_other"], False)

        self.client.force_authenticate(self.user)
        newest, older = self.client.get(messages).data["results"]
        self.assertIsNone(newest["read_by_other"])
        self.assertIs(older["read_by_other"], True)
        preview = self.client.get(self.threads).data["results"][0]
        self.assertEqual(preview["preview"], "A newer reply")
        self.assertEqual(preview["preview_sender"], self.support.id)
        self.assertEqual(preview["preview_created_at"], newest["created_at"])

        self.client.force_authenticate(self.admin)
        review = self.client.get(f"/api/auth/users/{self.user.pk}/conversations/{thread}/")
        self.assertTrue(all(item["read_by_other"] is None for item in review.data["results"]))


class TicketMigrationTests(TransactionTestCase):
    def test_migration_preserves_history_and_backfills_support_only(self):
        before = [("messaging", "0004_messagethread_group")]
        after = [("messaging", "0005_tickets_and_quoted_replies")]
        executor = MigrationExecutor(connection)
        executor.migrate(before)
        try:
            old = executor.loader.project_state(before).apps
            user = old.get_model("authentication", "User").objects.create(username="history", email="history@example.test")
            thread = old.get_model("messaging", "MessageThread")
            ticket = thread.objects.create(route="support_queue", created_by_id=user.pk, subject="Old ticket")
            direct = thread.objects.create(route="admin_direct", created_by_id=user.pk, subject="Old direct")
            message = old.get_model("messaging", "ThreadMessage").objects.create(
                thread_id=ticket.pk, sender_id=user.pk, content="Old message",
            )
            receipt = old.get_model("messaging", "ThreadReadReceipt").objects.create(user_id=user.pk, message_id=message.pk)

            executor = MigrationExecutor(connection)
            executor.migrate(after)
            current = executor.loader.project_state(after).apps
            threads = current.get_model("messaging", "MessageThread").objects
            self.assertEqual(threads.get(pk=ticket.pk).ticket_status, "open")
            self.assertIsNone(threads.get(pk=ticket.pk).ticket_assignee_id)
            self.assertIsNone(threads.get(pk=direct.pk).ticket_status)
            entry = current.get_model("messaging", "ThreadMessage").objects.get(pk=message.pk)
            self.assertEqual(entry.content, "Old message")
            self.assertIsNone(entry.reply_to_id)
            self.assertTrue(current.get_model("messaging", "ThreadReadReceipt").objects.filter(pk=receipt.pk).exists())
        finally:
            MigrationExecutor(connection).migrate(after)


@skipUnless(connection.vendor == "postgresql", "PostgreSQL row locks are required")
class TicketConcurrencyTests(TransactionTestCase):
    def test_only_one_agent_can_claim_a_ticket_concurrently(self):
        users = get_user_model().objects
        requester = users.create_user(username="requester", email="requester@example.test")
        thread = compose(requester, kind="support_queue", subject="Question", content="Help")
        support_role, _ = Role.objects.get_or_create(
            scope="platform", code="support", defaults={"label": "Support", "capabilities": ["messaging.support_queue"]},
        )
        agents = [users.create_user(username=name, email=f"{name}@example.test") for name in ("first", "second")]
        for agent in agents:
            PlatformRoleAssignment.objects.create(user=agent, role=support_role)
        start = Barrier(2, timeout=5)

        def claim(agent):
            try:
                start.wait()
                update_ticket(agent, thread.pk, {"assignee_id": agent.pk, "expected_assignee_id": None})
                return agent.pk
            except TicketOwnerConflict:
                return None
            finally:
                connections["default"].close()

        with ThreadPoolExecutor(max_workers=2) as workers:
            winners = [agent_id for agent_id in workers.map(claim, agents) if agent_id is not None]
        self.assertEqual(winners, [MessageThread.objects.get(pk=thread.pk).ticket_assignee_id])
        self.assertEqual(AuditEvent.objects.filter(subject=requester, action="support_ticket_updated").count(), 1)
