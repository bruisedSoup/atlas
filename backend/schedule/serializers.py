from rest_framework import serializers
from .models import ScheduleBlock


class ScheduleBlockSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.course_name", read_only=True)
    course_code = serializers.CharField(source="course.course_code", read_only=True)
    room_location = serializers.CharField(source="course.room_location", read_only=True)
    instructor_name = serializers.CharField(source="course.instructor_name", read_only=True)

    class Meta:
        model = ScheduleBlock
        fields = [
            "id",
            "course",
            "course_name",
            "course_code",
            "instructor_name",
            "room_location",
            "title",
            "day_of_week",
            "start_time",
            "end_time",
            "color",
            "notify_minutes_before",
            "source",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
