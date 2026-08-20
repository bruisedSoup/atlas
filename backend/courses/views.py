from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Course
from .serializers import CourseSerializer
from .ocr_service import process_cor_document
from schedule.models import ScheduleBlock


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"], url_path="scan-cor")
    def scan_cor(self, request):
        """
        Parses an uploaded Certificate of Registration (COR) / Student Load / Syllabus (PDF or Image)
        and returns extracted courses & schedules draft.
        """
        uploaded_file = request.FILES.get("file")
        use_sample = request.data.get("use_sample") in [True, "true", "1", 1]

        try:
            result = process_cor_document(
                file_obj=uploaded_file,
                use_sample=use_sample,
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to process document: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):
        """
        Saves confirmed courses and creates corresponding schedule blocks in database.
        """
        courses_data = request.data.get("courses", [])
        if not courses_data:
            return Response(
                {"error": "No courses provided for import."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        created_courses = []
        created_schedules = []

        day_normalization = {
            "mon": "Mon",
            "monday": "Mon",
            "tue": "Tue",
            "tuesday": "Tue",
            "wed": "Wed",
            "wednesday": "Wed",
            "thu": "Thu",
            "thurs": "Thu",
            "thursday": "Thu",
            "fri": "Fri",
            "friday": "Fri",
            "sat": "Sat",
            "saturday": "Sat",
            "sun": "Sun",
            "sunday": "Sun",
        }

        with transaction.atomic():
            for item in courses_data:
                name = item.get("course_name", "").strip() or item.get("course_code", "").strip()
                code = item.get("course_code", "").strip() or name
                instructor = item.get("instructor_name", "").strip()
                room = item.get("room_location", "").strip()
                color = item.get("color", "purple")

                if not name and not code:
                    continue

                # 1. Create or get Course
                course_obj, _ = Course.objects.get_or_create(
                    user=user,
                    course_name=name,
                    defaults={
                        "course_code": code,
                        "instructor_name": instructor,
                        "room_location": room,
                        "color": color,
                    },
                )
                created_courses.append(course_obj.id)

                # 2. Create Schedule Blocks
                schedules = item.get("schedules", [])
                for sched in schedules:
                    raw_days = sched.get("days", [])
                    if isinstance(raw_days, str):
                        raw_days = [raw_days]

                    start_t = sched.get("start_time", "").strip()
                    end_t = sched.get("end_time", "").strip()

                    # Fallback default times if missing
                    if not start_t:
                        start_t = "08:00:00"
                    elif len(start_t) == 5:
                        start_t = f"{start_t}:00"

                    if not end_t:
                        end_t = "10:00:00"
                    elif len(end_t) == 5:
                        end_t = f"{end_t}:00"

                    for d in raw_days:
                        norm_day = day_normalization.get(d.strip().lower(), "Mon")

                        # Create schedule block
                        block = ScheduleBlock.objects.create(
                            user=user,
                            course=course_obj,
                            title=name,
                            day_of_week=norm_day,
                            start_time=start_t,
                            end_time=end_t,
                            color=color,
                            source="ocr_import",
                        )
                        created_schedules.append(block.id)

        return Response(
            {
                "status": "success",
                "created_courses_count": len(created_courses),
                "created_schedules_count": len(created_schedules),
            },
            status=status.HTTP_201_CREATED,
        )
