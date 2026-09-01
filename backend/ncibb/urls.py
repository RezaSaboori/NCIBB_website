"""
URL configuration for NCIBB project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints only
    path('api/auth/', include('authentication.urls')),
    path('api/credits/', include('credits.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/core/', include('core.urls')),
    path('api/datasaz/', include('datasaz.urls')),
    path('api/datayab/', include('datayab.urls')),
]

# In production, serve the React SPA for any non-API route
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^(?!api/).*$', TemplateView.as_view(template_name='index.html')),  # frontend/dist/index.html
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
