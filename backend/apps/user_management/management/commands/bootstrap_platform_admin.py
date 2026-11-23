from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.user_management.access import audit
from apps.user_management.models import PlatformRoleAssignment, Role


class Command(BaseCommand):
    help = "Grant platform admin access to an active account verified by the database operator."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)

    @transaction.atomic
    def handle(self, *args, **options):
        user = get_user_model().objects.filter(email=options["email"], is_active=True).first()
        if not user:
            raise CommandError("Active account not found.")
        role = Role.objects.select_for_update().get(scope=Role.Scope.PLATFORM, code="admin")
        _, created = PlatformRoleAssignment.objects.get_or_create(user=user, role=role)
        if created:
            audit(None, "admin_bootstrapped", subject=user)
        self.stdout.write(self.style.SUCCESS(f"Platform admin access is active for user ID {user.pk}."))
