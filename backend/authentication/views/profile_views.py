# backend/authentication/views/profile_views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import MethodNotAllowed
from django.utils.cache import add_never_cache_headers

from apps.user_management.access import is_admin
from django.contrib.auth import get_user_model
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from ..models import UserProfile, ProfilePrivacySettings, UserPreferences
from ..serializers import (
    UserProfileSerializer, 
    PrivacySettingsSerializer,
    UserPreferencesSerializer,
    CompleteUserProfileSerializer
)
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class UserProfileViewSet(viewsets.ModelViewSet):
    """Complete user profile management"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        if self.action == 'list':
            # For admin users, return all profiles
            if is_admin(self.request.user):
                return UserProfile.objects.select_related('user').all()
            # For regular users, return only their profile
            return UserProfile.objects.filter(user=self.request.user)
        return UserProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Handle 'me' endpoint
        if self.kwargs.get('pk') == 'me':
            profile, created = UserProfile.objects.get_or_create(user=self.request.user)
            return profile
        return super().get_object()
    
    @transaction.atomic
    def perform_update(self, serializer):
        """Update profile with transaction safety"""
        instance = serializer.save()
        logger.info(f"User {self.request.user.id} updated profile")
        
        # Recalculate completion percentage
        instance.calculate_completion()
    
    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed(request.method)

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed(request.method)

    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def me(self, request):
        if request.method == "GET":
            user = User.objects.select_related("profile", "privacy_settings", "preferences").get(pk=request.user.pk)
            serializer = CompleteUserProfileSerializer(user, context={"request": request})
            response = Response(serializer.data)
            add_never_cache_headers(response)
            return response

        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=request.user.pk)
            serializer = CompleteUserProfileSerializer(
                user, data=request.data, partial=request.method == "PATCH", context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload-picture')
    def upload_picture(self, request, pk=None):
        """Handle profile picture upload"""
        try:
            profile = self.get_object()
            
            if 'profile_picture' not in request.FILES:
                return Response(
                    {'error': 'No image file provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete old profile picture
            if profile.profile_picture:
                profile.profile_picture.delete(save=False)
            
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
            
            serializer = UserProfileSerializer(profile, context={'request': request})
            return Response({
                'message': 'Profile picture updated successfully',
                'profile_picture_url': serializer.data['profile_picture_url']
            })
        
        except Exception as e:
            logger.error(f"Error uploading profile picture: {str(e)}")
            return Response(
                {'error': 'Failed to upload image'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['delete'], url_path='remove-picture')
    def remove_picture(self, request, pk=None):
        """Remove profile picture"""
        try:
            profile = self.get_object()
            if profile.profile_picture:
                profile.profile_picture.delete(save=True)
                return Response({'message': 'Profile picture removed successfully'})
            return Response(
                {'message': 'No profile picture to remove'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error removing profile picture for user {request.user.id}: {str(e)}")
            return Response(
                {'error': 'Failed to remove picture'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='me/completion-status')
    def completion_status(self, request):
        """Get profile completion status with recommendations"""
        try:
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            user = request.user

            if not user:
                return Response(
                    {'error': 'User not found for this profile'},
                    status=status.HTTP_404_NOT_FOUND
                )

            missing_fields = []
            # Check fields on User model
            if not user.first_name:
                missing_fields.append({
                    'field': 'first_name', 'label': 'First Name', 'priority': 'high'
                })
            if not user.last_name:
                missing_fields.append({
                    'field': 'last_name', 'label': 'Last Name', 'priority': 'high'
                })

            # Check fields on UserProfile model
            profile_fields = {
                'job_title': 'Job Title',
                'company': 'Company',
                'city': 'City',
                'country': 'Country',
                'profile_picture': 'Profile Picture'
            }

            for field, label in profile_fields.items():
                if not getattr(profile, field):
                    missing_fields.append({
                        'field': field, 'label': label, 'priority': 'medium'
                    })
            
            return Response({
                'completion_percentage': profile.profile_completion_percentage,
                'is_complete': profile.is_profile_complete,
                'missing_fields': missing_fields,
                'recommendations': self._generate_recommendations(missing_fields)
            })
            
        except Exception as e:
            logger.error(f"Error getting completion status: {str(e)}")
            return Response(
                {'error': 'Failed to get completion status'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_recommendations(self, missing_fields):
        """Generate personalized completion recommendations"""
        recommendations = []
        high_priority = [f for f in missing_fields if f['priority'] == 'high']
        
        if high_priority:
            recommendations.append({
                'type': 'urgent',
                'title': 'Complete Basic Information',
                'message': f"Add your {', '.join([f['label'] for f in high_priority])} to improve profile visibility",
                'action_text': 'Complete Now'
            })
        
        if len(missing_fields) > 4:
            recommendations.append({
                'type': 'info', 
                'title': 'Profile Needs Attention',
                'message': 'Complete your profile to unlock all platform features',
                'action_text': 'View Missing Fields'
            })
            
        return recommendations

class PrivacySettingsViewSet(viewsets.ModelViewSet):
    """Privacy settings management"""
    serializer_class = PrivacySettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ProfilePrivacySettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        obj, created = ProfilePrivacySettings.objects.get_or_create(user=self.request.user)
        return obj
    
    @action(detail=False, methods=['post'], url_path='bulk-update')
    def bulk_update(self, request):
        """Update multiple privacy settings"""
        try:
            settings, created = ProfilePrivacySettings.objects.get_or_create(user=request.user)
            serializer = PrivacySettingsSerializer(settings, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                logger.info(f"User {request.user.id} updated privacy settings")
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating privacy settings: {str(e)}")
            return Response(
                {'error': 'Failed to update privacy settings'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
