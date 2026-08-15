import uuid
from django.db import models
from users.models import User


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses")
    course_name = models.CharField(max_length=255)
    course_code = models.CharField(max_length=50, blank=True, default="")
    instructor_name = models.CharField(max_length=255, blank=True, default="")
    room_location = models.CharField(max_length=255, blank=True, default="")
    color = models.CharField(max_length=50, default="#3b82f6")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "atlas_courses"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.course_name} ({self.course_code})"
