# backend/authentication/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from PIL import Image
import uuid
import os

class User(AbstractUser):
    """Enhanced user model building on existing NCIBB structure"""
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('user', 'Regular User'),
        ('guest', 'Guest User'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    # Keep existing fields from your current implementation
    # Add new profile-specific fields
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Enter a valid phone number.')],
        null=True, blank=True
    )
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    last_activity = models.DateTimeField(null=True, blank=True)
    profile_completion_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name
    
    def __str__(self):
        return self.get_full_name() or self.email

    def save(self, *args, **kwargs):
        if self.pk is None:
            # For new users, ensure email is used as username if username is not provided
            if not self.username:
                self.username = self.email
        
        # Ensure that the email field is always set for the user
        if not self.email:
            raise ValueError("User must have an email address")

        super().save(*args, **kwargs)
        # Create profile if doesn't exist
        if not hasattr(self, 'profile'):
            UserProfile.objects.get_or_create(user=self)


class UserProfile(models.Model):
    """Comprehensive user profile model"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal Information
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True) 
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=20,
        choices=[
            ('male', 'Male'),
            ('female', 'Female'), 
            ('other', 'Other'),
            ('prefer_not_to_say', 'Prefer not to say')
        ],
        blank=True
    )
    
    # Professional Information
    job_title = models.CharField(max_length=200, blank=True)
    company = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    
    # Location & Contact
    address_line_1 = models.CharField(max_length=255, blank=True)
    address_line_2 = models.CharField(max_length=255, blank=True) 
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Media
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        null=True, 
        blank=True
    )
    cover_image = models.ImageField(
        upload_to='cover_images/',
        null=True,
        blank=True  
    )
    
    # Preferences
    language = models.CharField(max_length=10, default='en')
    theme = models.CharField(
        max_length=20,
        choices=[('light', 'Light'), ('dark', 'Dark'), ('auto', 'Auto')],
        default='light'
    )
    
    # System fields
    is_profile_complete = models.BooleanField(default=False)
    profile_completion_percentage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['company', 'job_title']),
            models.Index(fields=['city', 'country']),
        ]

    def save(self, *args, **kwargs):
        # Set first_name and last_name from user model if they are empty
        if not self.first_name and self.user.first_name:
            self.first_name = self.user.first_name
        if not self.last_name and self.user.last_name:
            self.last_name = self.user.last_name
            
        super().save(*args, **kwargs)
        if self.profile_picture:
            try:
                # Optimize image
                img = Image.open(self.profile_picture.path)
                if img.height > 500 or img.width > 500:
                    img.thumbnail((500, 500), Image.LANCZOS)
                    img.save(self.profile_picture.path, optimize=True, quality=85)
            except FileNotFoundError:
                # This can happen if the file doesn't exist yet (e.g., in-memory upload)
                # The image will be processed once it's saved to the filesystem.
                pass
        
        # Update completion percentage
        self.calculate_completion()

    def calculate_completion(self):
        """Calculate profile completion percentage"""
        required_fields = [
            'first_name', 'last_name', 'job_title',
            'company', 'city', 'country', 'profile_picture'
        ]
        completed_fields = sum(1 for field in required_fields if getattr(self, field, None))
        percentage = int((completed_fields / len(required_fields)) * 100)
        
        if self.profile_completion_percentage != percentage:
            self.profile_completion_percentage = percentage
            self.is_profile_complete = percentage >= 80
            self.save(update_fields=['profile_completion_percentage', 'is_profile_complete'])

    def __str__(self):
        return f"{self.user.get_full_name()}'s Profile"

class ProfilePrivacySettings(models.Model):
    """Privacy controls for profile visibility"""
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('authenticated', 'Logged-in users only'),
        ('connections', 'Connections only'), 
        ('private', 'Private'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='privacy_settings')
    
    # Field-level privacy
    email_visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='authenticated')
    phone_visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    address_visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    job_info_visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    social_links_visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    
    # Activity privacy
    show_online_status = models.BooleanField(default=True)
    show_last_activity = models.BooleanField(default=True)
    allow_search_engines = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class UserPreferences(models.Model):
    """User application preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    # Specific notification types
    project_updates = models.BooleanField(default=True)
    system_announcements = models.BooleanField(default=True)
    security_alerts = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    # Dashboard preferences
    default_dashboard_layout = models.JSONField(default=dict)
    items_per_page = models.IntegerField(default=25)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)