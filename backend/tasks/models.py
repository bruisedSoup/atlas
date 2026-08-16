import uuid
from django.db import models
from users.models import User
from courses.models import Course


class CustomLabel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="custom_labels")
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "atlas_custom_labels"
        ordering = ["created_at"]
        unique_together = ["user", "name"]

    def __str__(self):
        return self.name


class Task(models.Model):
    STATUS_CHOICES = [
        ("ongoing", "Ongoing"),
        ("done", "Done"),
        ("archived", "Archived"),
    ]

    LABEL_CHOICES = [
        ("custom", "Custom"),
        ("course", "Course"),
    ]

    PLATFORM_CHOICES = [
        ("manual", "Manual"),
        ("canvas", "Canvas"),
        ("google_classroom", "Google Classroom"),
        ("ustep", "USTeP"),
        ("google_calendar", "Google Calendar"),
        ("ocr", "OCR"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    course = models.ForeignKey(
        Course, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    label_type = models.CharField(max_length=20, choices=LABEL_CHOICES, default="custom")
    custom_label = models.CharField(max_length=100, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ongoing")
    deadline_date = models.DateField(null=True, blank=True)
    deadline_time = models.TimeField(null=True, blank=True)
    notify_before_deadline = models.BooleanField(default=False)
    reminder_sent = models.BooleanField(default=False)
    color = models.CharField(max_length=50, default="#60a5fa")  # pushpin color
    icon_seed = models.IntegerField(default=0)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES, default="manual")
    source = models.CharField(max_length=50, default="manual")
    source_id = models.CharField(max_length=255, blank=True, default="")
    original_link = models.URLField(max_length=1024, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "atlas_tasks"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.status})"
