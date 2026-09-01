from django.apps import AppConfig


class DatayabConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'datayab'

    def ready(self):
        pass