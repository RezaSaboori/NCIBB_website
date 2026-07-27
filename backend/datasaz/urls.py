from django.urls import path
from . import views

app_name = "datasaz"

urlpatterns = [
    path("autocomplete/", views.autocomplete_proxy, name="autocomplete_proxy"),
]