from django.core.management.base import BaseCommand

from datayab.services import ingest_databases


class Command(BaseCommand):
    help = "Embed frontend/data/databases_infos.csv into the ChromaDB store used by Datayab."

    def handle(self, *args, **options):
        count = ingest_databases()
        self.stdout.write(self.style.SUCCESS(f"Embedded {count} database records."))