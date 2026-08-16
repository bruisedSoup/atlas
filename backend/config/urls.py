"""config/urls.py — Atlas API root URL config"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/users/", include("users.urls")),
    path("api/tasks/", include("tasks.urls")),
    path("api/courses/", include("courses.urls")),
    path("api/schedule/", include("schedule.urls")),
]
