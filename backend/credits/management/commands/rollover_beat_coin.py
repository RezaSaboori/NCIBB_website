from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from credits.services import personal_wallet


class Command(BaseCommand):
    help = "Reconcile current Beat Coin allowances and expire previous monthly credits."

    def handle(self, *args, **options):
        users = get_user_model().objects.order_by("pk").iterator(chunk_size=500)
        for user in users:
            personal_wallet(user)
