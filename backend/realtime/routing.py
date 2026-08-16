from django.urls import re_path
from realtime.consumers import AtlasRealtimeConsumer

websocket_urlpatterns = [
    re_path(r"^ws/realtime/$", AtlasRealtimeConsumer.as_asgi()),
    re_path(r"^ws/notifications/$", AtlasRealtimeConsumer.as_asgi()),
    re_path(r"^ws/tasks/$", AtlasRealtimeConsumer.as_asgi()),
]
