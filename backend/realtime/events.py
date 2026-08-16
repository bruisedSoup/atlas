import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone

logger = logging.getLogger(__name__)

def broadcast_to_user(user_id, event_type, payload=None):
    """
    Send a real-time event to all active WebSocket connections for a specific user.
    """
    if not user_id:
        return

    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    group_name = f"user_{user_id}"
    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "realtime_event",
                "event": event_type,
                "payload": payload or {},
                "timestamp": timezone.now().isoformat(),
            },
        )
    except Exception as e:
        logger.error(f"Failed to broadcast real-time event {event_type} to {group_name}: {e}")

def send_realtime_notification(user_id, title, message, task_id=None, task_title=None, deadline_time=None, notification_type="reminder"):
    """
    Send an in-app real-time notification push to a user's WebSocket.
    """
    if not user_id:
        return

    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    group_name = f"user_{user_id}"
    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "notification_message",
                "notification_type": notification_type,
                "title": title,
                "message": message,
                "task_id": str(task_id) if task_id else None,
                "task_title": task_title,
                "deadline_time": str(deadline_time) if deadline_time else None,
                "timestamp": timezone.now().isoformat(),
            },
        )
    except Exception as e:
        logger.error(f"Failed to send real-time notification to {group_name}: {e}")
