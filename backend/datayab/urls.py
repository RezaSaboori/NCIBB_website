from django.urls import path
from . import views

urlpatterns = [
    path("search/", views.datayab_search, name="datayab-search"),
]