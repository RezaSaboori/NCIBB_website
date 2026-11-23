from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.db import transaction
from authentication.models import User, UserProfile
from ..serializers import (
    UserRegistrationSerializer, 
    UserProfileSerializer,
    UserDashboardSerializer,
    UserSerializer
)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_api(request):
    """Test endpoint to verify API is working"""
    return Response({"message": "API is working!", "status": "success"})


class LoginThrottle(AnonRateThrottle):
    scope = "account_login"
    rate = "60/hour"


class RegistrationThrottle(AnonRateThrottle):
    scope = "account_registration"
    rate = "15/hour"


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
@throttle_classes([LoginThrottle])
def simple_login(request):
    email = request.data.get("email")
    password = request.data.get("password")
    if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
        return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=email, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    update_last_login(None, user)
    refresh = RefreshToken.for_user(user)
    return Response({
        "user": UserSerializer(user, context={"request": request}).data,
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    })


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [RegistrationThrottle]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        from credits.services import personal_wallet

        personal_wallet(user)
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class UserDashboardView(generics.RetrieveAPIView):
    serializer_class = UserDashboardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        token = RefreshToken(request.data.get("refresh", ""))
        if str(token.get("user_id")) != str(request.user.pk):
            raise ValidationError({"refresh": "Invalid session token."})
        token.blacklist()
    except TokenError as error:
        raise ValidationError({"refresh": "Invalid session token."}) from error
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats_view(request):
    """
    Get user statistics for dashboard
    """
    user = request.user
    
    # Get user's project stats
    try:
        from projects.models import Project
        project_stats = {
            'total_projects': Project.objects.filter(owner=user).count(),
            'active_projects': Project.objects.filter(owner=user, status='active').count(),
            'completed_projects': Project.objects.filter(owner=user, status='completed').count(),
        }
    except:
        project_stats = {
            'total_projects': 0,
            'active_projects': 0,
            'completed_projects': 0,
        }
    
    # Get user's credit stats
    try:
        credits = user.credits
        credit_stats = {
            'balance': str(credits.balance + credits.monthly_balance),
            'total_earned': str(credits.total_earned),
            'total_spent': str(credits.total_spent),
        }
    except:
        credit_stats = {
            'balance': '0.00',
            'total_earned': '0.00',
            'total_spent': '0.00',
        }
    
    from messaging.routing import thread_list

    recent_activity = [
        {"type": "message", "title": entry.subject, "description": "", "created_at": entry.updated_at}
        for entry in thread_list(user)[:5]
    ]
    
    return Response({
        'project_stats': project_stats,
        'credit_stats': credit_stats,
        'recent_activity': recent_activity,
    })