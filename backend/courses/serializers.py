from rest_framework import serializers
from .models import Course
from schedule.models import ScheduleBlock


class CourseScheduleBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleBlock
        fields = [
            "id",
            "day_of_week",
            "start_time",
            "end_time",
            "room_location",
            "instructor_name",
        ]


class CourseSerializer(serializers.ModelSerializer):
    has_schedule = serializers.SerializerMethodField()
    schedule_days = serializers.SerializerMethodField()
    schedule_start_time = serializers.SerializerMethodField()
    schedule_end_time = serializers.SerializerMethodField()
    schedule_blocks = CourseScheduleBlockSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "course_name",
            "course_code",
            "instructor_name",
            "room_location",
            "color",
            "has_schedule",
            "schedule_days",
            "schedule_start_time",
            "schedule_end_time",
            "schedule_blocks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_has_schedule(self, obj):
        return obj.schedule_blocks.exists()

    def get_schedule_days(self, obj):
        # Normalize Thu / Thurs so frontend highlights Thurs correctly
        days = []
        for block in obj.schedule_blocks.all():
            d = block.day_of_week
            if d == "Thu":
                d = "Thurs"
            if d not in days:
                days.append(d)
        return days

    def get_schedule_start_time(self, obj):
        first_block = obj.schedule_blocks.first()
        if first_block and first_block.start_time:
            return first_block.start_time.strftime("%H:%M")
        return ""

    def get_schedule_end_time(self, obj):
        first_block = obj.schedule_blocks.first()
        if first_block and first_block.end_time:
            return first_block.end_time.strftime("%H:%M")
        return ""
