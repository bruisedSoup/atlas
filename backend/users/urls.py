"""users/urls.py"""
from django.urls import path
from . import views

urlpatterns = [
    path("session/", views.session_view, name="auth-session"),
    path("profile/", views.profile_view, name="user-profile"),
]
