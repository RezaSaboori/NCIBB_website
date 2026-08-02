from django.contrib import admin
from .models import DatasazProject


@admin.register(DatasazProject)
class DatasazProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'current_step', 'status', 'created_at')
    list_filter = ('status', 'current_step')
    search_fields = ('name', 'owner__email')