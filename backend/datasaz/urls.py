from django.urls import path
from . import views

urlpatterns = [
    path("autocomplete/", views.autocomplete_proxy, name="autocomplete-proxy"),
    path("projects/", views.project_list, name="datasaz-project-list"),
    path("projects/<int:pk>/", views.project_detail, name="datasaz-project-detail"),
    path("projects/<int:pk>/step/", views.save_step, name="datasaz-save-step"),
]