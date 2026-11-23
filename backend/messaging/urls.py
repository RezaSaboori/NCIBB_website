from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    # Message endpoints
    path('messages/', views.MessageListView.as_view(), name='message_list'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(), name='message_detail'),
    path('send/', views.send_message_view, name='send_message'),
    
    path('destinations/', views.destinations_view, name='destinations'),
    path('threads/<int:thread_id>/read/', views.mark_thread_read_view, name='thread_read'),
    path('threads/<int:thread_id>/forward/', views.forward_view, name='thread_forward'),

    # Thread endpoints
    path('threads/', views.MessageThreadListView.as_view(), name='thread_list'),
    path('threads/<int:pk>/', views.MessageThreadDetailView.as_view(), name='thread_detail'),
    path('threads/<int:thread_id>/messages/', views.ThreadMessageListView.as_view(), name='thread_message_list'),
    
    # Notification endpoints
    path('notifications/', views.NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification_detail'),
    
    # Utility endpoints
    path('inbox/', views.inbox_view, name='inbox'),
    path('mark-all-read/', views.mark_all_read_view, name='mark_all_read'),
    path('stats/', views.message_stats_view, name='message_stats'),
]
