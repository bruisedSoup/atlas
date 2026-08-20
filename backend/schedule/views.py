from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ScheduleBlock
from .serializers import ScheduleBlockSerializer


class ScheduleBlockViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleBlockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ScheduleBlock.objects.filter(user=self.request.user).order_by("day_of_week", "start_time")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
