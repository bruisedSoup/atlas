from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, CustomLabelViewSet

router = DefaultRouter()
router.register(r"custom-labels", CustomLabelViewSet, basename="custom-labels")
router.register(r"", TaskViewSet, basename="tasks")

urlpatterns = router.urls
