from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task, CustomLabel
from .serializers import TaskSerializer, CustomLabelSerializer


class CustomLabelViewSet(viewsets.ModelViewSet):
    serializer_class = CustomLabelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomLabel.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


from django.utils import timezone

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user)
        status_param = self.request.query_params.get("status")
        if status_param == "ongoing":
            qs = qs.filter(status="ongoing")
        elif status_param in ["done", "completed"]:
            qs = qs.filter(status__in=["done", "completed"])
        elif status_param == "missed":
            today = timezone.now().date()
            qs = qs.filter(status="ongoing", deadline_date__lt=today)
        elif status_param:
            qs = qs.filter(status=status_param)

        label_param = self.request.query_params.get("label_type")
        if label_param:
            qs = qs.filter(label_type=label_param)
        custom_label_param = self.request.query_params.get("custom_label")
        if custom_label_param:
            qs = qs.filter(custom_label=custom_label_param)
        course_id = self.request.query_params.get("course")
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
