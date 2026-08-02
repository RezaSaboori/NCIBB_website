from django.apps import AppConfig


class DatasazConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'datasaz'

    def ready(self):
        pass