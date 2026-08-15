import uuid
from django.db import models
from users.models import User
from courses.models import Course


class ScheduleBlock(models.Model):
    DAY_CHOICES = [
        ("Mon", "Monday"),
        ("Tue", "Tuesday"),
        ("Wed", "Wednesday"),
        ("Thu", "Thursday"),
        ("Fri", "Friday"),
        ("Sat", "Saturday"),
        ("Sun", "Sunday"),
    ]

    SOURCE_CHOICES = [
        ("manual", "Manual"),
        ("ocr_import", "OCR Import"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="schedule_blocks")
    course = models.ForeignKey(
        Course, on_delete=models.SET_NULL, null=True, blank=True, related_name="schedule_blocks"
    )
    title = models.CharField(max_length=255)
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    color = models.CharField(max_length=50, default="#3b82f6")
    notify_minutes_before = models.IntegerField(default=15)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="manual")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "atlas_schedule_blocks"
        ordering = ["day_of_week", "start_time"]

    def __str__(self):
        return f"{self.title} ({self.day_of_week} {self.start_time}-{self.end_time})"
