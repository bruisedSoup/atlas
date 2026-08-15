from rest_framework import serializers
from .models import Task
from courses.serializers import CourseSerializer


class TaskSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source="course", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "course",
            "course_detail",
            "title",
            "description",
            "label_type",
            "status",
            "deadline_date",
            "deadline_time",
            "notify_before_deadline",
            "color",
            "icon_seed",
            "platform",
            "source",
            "source_id",
            "original_link",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
