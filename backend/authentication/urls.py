from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from apps.user_management import verification
from .views import profile_views
from .views import general_views as views

app_name = 'authentication'

router = DefaultRouter()
router.register(r'profile', profile_views.UserProfileViewSet, basename='userprofile')
router.register(r'privacy', profile_views.PrivacySettingsViewSet, basename='privacy')

urlpatterns = [
    # Your existing URLs
    path('test/', views.test_api, name='test_api'),
    
    # Authentication endpoints
    path('login/', views.simple_login, name='login'),
    path('login-old/', views.simple_login, name='login_old'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    
    # User endpoints
    path('dashboard/', views.UserDashboardView.as_view(), name='dashboard'),
    path('stats/', views.user_stats_view, name='user_stats'),
    path("email-verification/", verification.send_verification),
    path("email-verification/confirm/", verification.confirm_verification),
    path("", include("apps.user_management.urls")),
    
    # Add profile-specific endpoints
    path('', include(router.urls)),
]
