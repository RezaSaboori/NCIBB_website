from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.user_management.access import audit
from apps.user_management.models import PlatformRoleAssignment, Role
from authentication.models import User
from credits.services import personal_wallet


class Command(BaseCommand):
    help = "Create an account with a registered platform role."

    def add_arguments(self, parser):
        for field in ("username", "email", "password", "first-name", "last-name"):
            parser.add_argument(f"--{field}", required=True)
        parser.add_argument("--role", default="user")
        parser.add_argument("--phone")
        parser.add_argument("--is-active", action="store_true")

    @transaction.atomic
    def handle(self, *args, **options):
        code = options["role"]
        role = Role.objects.filter(scope=Role.Scope.PLATFORM, code=code).first()
        if role is None:
            raise CommandError("Unknown platform role.")
        user = User.objects.create_user(**{
            key: options[key] for key in
            ("username", "email", "password", "first_name", "last_name", "phone", "is_active")
        })
        if code != "user":
            PlatformRoleAssignment.objects.create(user=user, role=role)
        personal_wallet(user)
        audit(None, "account_created", subject=user, role=code)
        self.stdout.write(self.style.SUCCESS(f"Created user ID {user.pk}."))
