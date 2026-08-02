from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DatasazProject(models.Model):
    """
    Ties a user's portal Project to datasaz step state and step-2 definition values.
    One DatasazProject per portal Project that was initiated via the datasaz mode.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('step1_complete', 'Step 1 Complete'),
        ('step2_complete', 'Step 2 Complete'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
    ]

    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='datasaz_projects'
    )
    name = models.CharField(max_length=255)
    estimated_count = models.PositiveIntegerField(null=True, blank=True)

    # Which datasaz step the user is currently on (1–4)
    current_step = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')

    # Step 2 — inclusion/exclusion criteria stored as structured JSON
    # Shape: { "inclusion": [...CriteriaItem], "exclusion": [...CriteriaItem] }
    step2_definition = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'datasaz_projects'
        verbose_name = 'Datasaz Project'
        verbose_name_plural = 'Datasaz Projects'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.owner.get_full_name()} — {self.name}"