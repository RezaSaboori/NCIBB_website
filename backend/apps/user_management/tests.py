from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from credits.models import CreditTransaction
from datasaz.models import DatasazProject
from projects.models import Project
from .models import AuditEvent, PlatformRoleAssignment, Role

User = get_user_model()


class AccountWorkflowTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.admin = self.create_account("siteadmin", "admin")
        self.support = self.create_account("support", "support")
        self.student = self.create_account("student", "student")
        self.professor = self.create_account("professor", "professor")
        self.other = self.create_account("other")

    def create_account(self, name, role=None):
        user = User.objects.create_user(username=name, email=f"{name}@example.test", password=None)
        if role:
            PlatformRoleAssignment.objects.create(user=user, role=Role.objects.get(scope="platform", code=role))
        return user

    def login_as(self, user):
        self.client.force_authenticate(user)

    def compose(self, kind, **extra):
        return self.client.post("/api/messaging/threads/", {
            "kind": kind, "subject": "Question", "content": "Can you help?", **extra,
        }, format="json")

    def test_signup_and_role_changes_are_enforced_on_existing_tokens(self):
        response = self.client.post("/api/auth/register/", {
            "username": "external", "email": "external@example.test", "first_name": "Test", "last_name": "User",
            "password": "My_Correct_Horse_1234", "password_confirm": "My_Correct_Horse_1234",
            "role": "admin", "is_superuser": True,
        }, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["user"]["role"], "user")
        token = response.data["access"]
        user_id = response.data["user"]["id"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(self.client.get("/api/auth/users/").status_code, 403)
        self.assertEqual(self.client.get("/api/auth/research-groups/").status_code, 403)
        self.assertEqual(self.client.patch("/api/auth/profile/me/", {"role": "admin"}, format="json").status_code, 200)

        self.login_as(self.admin)
        custom = self.client.post("/api/auth/roles/", {
            "label": "Research access", "code": "research-access", "scope": "platform",
            "capabilities": ["profile.research_groups"],
        }, format="json")
        self.assertEqual(custom.status_code, 201, custom.data)
        endpoint = f"/api/auth/users/{user_id}/access/"
        self.assertEqual(self.client.patch(endpoint, {"roles": [custom.data["id"]]}, format="json").status_code, 200)
        self.login_as(None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(self.client.get("/api/auth/research-groups/").status_code, 200)
        self.assertEqual(self.client.get("/api/auth/users/").status_code, 403)
        self.login_as(self.admin)
        self.assertEqual(self.client.patch(endpoint, {"is_active": False}, format="json").status_code, 200)
        self.login_as(None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(self.client.get("/api/auth/profile/me/").status_code, 401)

    def test_protect_last_admin_and_all_user_subresources(self):
        self.login_as(self.admin)
        response = self.client.patch(f"/api/auth/users/{self.admin.pk}/access/", {"roles": []}, format="json")
        self.assertEqual(response.status_code, 400)
        self.login_as(self.support)
        for suffix in ("", "projects/", "credits/", "conversations/", "audit/"):
            self.assertEqual(self.client.get(f"/api/auth/users/{self.student.pk}/{suffix}").status_code, 403)

    def test_admin_project_summary_includes_both_services_and_uses_owner(self):
        DatasazProject.objects.create(owner=self.student, name="Datasaz item")
        DatasazProject.objects.create(owner=self.other, name="Other user's item")
        Project.objects.create(owner=self.student, title="Project item", start_date=timezone.now())
        self.login_as(self.admin)
        response = self.client.get(f"/api/auth/users/{self.student.pk}/projects/")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual({row["name"] for row in response.data["results"]}, {"Project item", "Datasaz item"})

    def test_support_and_admin_conversations_and_forwarding(self):
        self.login_as(self.student)
        self.assertEqual(self.compose("admin_direct", recipient=self.admin.pk).status_code, 403)
        self.assertEqual(self.compose("admin_queue").status_code, 403)
        self.assertEqual(self.client.post("/api/messaging/send/", {
            "recipient": self.other.pk, "subject": "Denied", "content": "Text",
        }, format="json").status_code, 403)
        support_thread = self.compose("support_queue")
        self.assertEqual(support_thread.status_code, 201, support_thread.data)
        thread = support_thread.data["id"]
        messages = f"/api/messaging/threads/{thread}/messages/"

        self.login_as(self.other)
        self.assertEqual(self.client.get(messages).status_code, 404)
        self.assertEqual(self.client.post(messages, {"content": "Unauthorized"}, format="json").status_code, 404)

        self.login_as(self.support)
        listing = self.client.get("/api/messaging/threads/")
        self.assertEqual(listing.data["results"][0]["unread_count"], 1)
        message_id = self.client.get(messages).data["results"][0]["id"]
        self.assertEqual(self.client.post(f"/api/messaging/threads/{thread}/read/", {
            "through": message_id,
        }, format="json").status_code, 204)
        self.assertEqual(self.client.get("/api/messaging/threads/").data["results"][0]["unread_count"], 0)
        self.assertEqual(self.client.post(messages, {"content": "We're working on it."}, format="json").status_code, 201)
        forwarded = self.client.post(f"/api/messaging/threads/{thread}/forward/", {
            "kind": "admin_queue", "subject": "Escalation", "content": "", "message_ids": [message_id],
        }, format="json")
        self.assertEqual(forwarded.status_code, 201, forwarded.data)

        self.login_as(self.admin)
        self.assertEqual(self.client.get(messages).status_code, 404)
        review = self.client.get(f"/api/auth/users/{self.student.pk}/conversations/{thread}/")
        self.assertEqual(review.status_code, 200, review.data)
        self.assertTrue(AuditEvent.objects.filter(actor=self.admin, subject=self.student, action="conversation_reviewed").exists())
        forwarded_messages = self.client.get(f"/api/messaging/threads/{forwarded.data['id']}/messages/").data["results"]
        self.assertEqual(len(forwarded_messages), 1)
        self.assertTrue(forwarded_messages[0]["forwarded"])
        direct = self.compose("admin_direct", recipient=self.student.pk)
        self.assertEqual(direct.status_code, 201, direct.data)
        self.login_as(self.student)
        self.assertEqual(self.client.post(f"/api/messaging/threads/{direct.data['id']}/messages/", {
            "content": "Thank you.",
        }, format="json").status_code, 201)

    def test_mentorship_and_spending_are_group_scoped(self):
        self.login_as(self.admin)
        parent = self.client.post("/api/auth/groups/", {"name": "Institution"}, format="json").data["id"]
        group = self.client.post("/api/auth/groups/", {"name": "Research", "parent": parent}, format="json").data["id"]
        self.assertEqual(self.client.patch(f"/api/auth/groups/{parent}/", {"parent": group}, format="json").status_code, 400)
        membership_ids = {}
        for user, role in ((self.professor, "professor"), (self.student, "student"), (self.support, "group-admin")):
            role_id = Role.objects.get(scope="group", code=role).pk
            result = self.client.put(f"/api/auth/groups/{group}/members/{user.pk}/", {"roles": [role_id]}, format="json")
            self.assertEqual(result.status_code, 200, result.data)
            membership_ids[role] = result.data["id"]
        link = self.client.post(f"/api/auth/groups/{group}/mentors/", {
            "professor": membership_ids["professor"], "student": membership_ids["student"],
        }, format="json")
        self.assertEqual(link.status_code, 201, link.data)
        self.login_as(self.student)
        self.assertEqual(self.compose("mentor", recipient=self.professor.pk, group=parent).status_code, 403)
        thread = self.compose("mentor", recipient=self.professor.pk, group=group)
        self.assertEqual(thread.status_code, 201, thread.data)
        self.login_as(self.support)
        self.assertEqual(self.client.get(f"/api/auth/groups/{parent}/wallet/").status_code, 403)
        self.assertEqual(self.client.patch(f"/api/auth/groups/{group}/spending/{membership_ids['student']}/", {
            "can_spend": True,
        }, format="json").status_code, 200)
        self.login_as(self.student)
        wallet = self.client.get("/api/credits/")
        self.assertEqual(wallet.data["groups"][0]["id"], group)
        self.login_as(self.admin)
        self.assertEqual(self.client.delete(f"/api/auth/groups/{group}/mentors/{link.data['id']}/").status_code, 204)
        self.login_as(self.student)
        self.assertEqual(self.client.get(f"/api/messaging/threads/{thread.data['id']}/").status_code, 404)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", BEAT_COIN_EMAIL_REWARD="4.00")
    def test_email_verification_is_single_award(self):
        self.login_as(self.student)
        self.assertEqual(self.client.post("/api/auth/email-verification/").status_code, 204)
        secret = mail.outbox[-1].body.split("#token=")[1].strip()
        self.login_as(None)
        for _ in range(2):
            self.assertEqual(self.client.post(
                "/api/auth/email-verification/confirm/", {"token": secret}, format="json",
            ).status_code, 204)
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_email_verified)
        self.assertEqual(CreditTransaction.objects.filter(user=self.student, description="email_verification").count(), 1)
        self.login_as(self.student)
        self.assertEqual(self.client.patch("/api/auth/profile/me/", {"email": "changed@example.test"}, format="json").status_code, 200)
        self.login_as(None)
        self.assertEqual(self.client.post(
            "/api/auth/email-verification/confirm/", {"token": secret}, format="json",
        ).status_code, 400)
