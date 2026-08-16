import json
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer

logger = logging.getLogger(__name__)

class AtlasRealtimeConsumer(AsyncJsonWebsocketConsumer):
    """
    Main WebSocket consumer for Atlas real-time sync and notification pushes.
    """

    async def connect(self):
        user_id = self.scope.get("user_id")
        self.user = self.scope.get("user")

        if user_id:
            self.user_group_name = f"user_{user_id}"
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        else:
            self.user_group_name = None

        # Also join global broadcast group
        self.global_group_name = "atlas_global"
        await self.channel_layer.group_add(self.global_group_name, self.channel_name)

        await self.accept()

        # Send initial connection handshake confirmation
        await self.send_json({
            "type": "connection_established",
            "authenticated": bool(user_id),
            "user_id": str(user_id) if user_id else None,
            "message": "Connected to Atlas Realtime WebSocket",
        })

    async def disconnect(self, close_code):
        if self.user_group_name:
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
        await self.channel_layer.group_discard(self.global_group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        """
        Handle incoming client WebSocket messages.
        """
        action = content.get("action") or content.get("type")

        if action == "ping":
            await self.send_json({"type": "pong", "timestamp": content.get("timestamp")})
            return

        if action == "broadcast_event" and self.user_group_name:
            # Client broadcast to user group
            event_type = content.get("event")
            payload = content.get("payload", {})
            await self.channel_layer.group_send(
                self.user_group_name,
                {
                    "type": "realtime_event",
                    "event": event_type,
                    "payload": payload,
                    "sender_channel": self.channel_name,
                },
            )

    async def realtime_event(self, event):
        """
        Handler for real-time events sent via channel layer.
        """
        # Avoid echo back to the sender if requested
        if event.get("sender_channel") == self.channel_name:
            return

        await self.send_json({
            "type": "realtime_event",
            "event": event.get("event"),
            "payload": event.get("payload", {}),
            "timestamp": event.get("timestamp"),
        })

    async def notification_message(self, event):
        """
        Handler for push notifications (e.g. 15-minute deadline reminder).
        """
        await self.send_json({
            "type": "notification",
            "notification_type": event.get("notification_type", "reminder"),
            "title": event.get("title", "Atlas Notification"),
            "message": event.get("message", ""),
            "task_id": event.get("task_id"),
            "task_title": event.get("task_title"),
            "deadline_time": event.get("deadline_time"),
            "timestamp": event.get("timestamp"),
        })
