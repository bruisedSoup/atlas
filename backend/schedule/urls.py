from rest_framework.routers import DefaultRouter
from .views import ScheduleBlockViewSet

router = DefaultRouter()
router.register(r"", ScheduleBlockViewSet, basename="schedule")

urlpatterns = router.urls
