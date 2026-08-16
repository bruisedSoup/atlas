"""
tasks/apps.py

Starts the background deadline-reminder scheduler thread when Django boots.
Checks every 60 seconds for tasks due within the next 15 minutes and sends
an email + in-app WebSocket notification.
"""
import threading
import time
import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class TasksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "tasks"

    def ready(self):
        # Avoid running twice (Django calls ready() twice with autoreload)
        import os
        if os.environ.get("RUN_MAIN") != "true":
            return

        thread = threading.Thread(target=self._run_reminder_loop, daemon=True)
        thread.start()
        logger.info("[Atlas] Deadline reminder background thread started.")

    @staticmethod
    def _run_reminder_loop():
        # Wait for Django to fully initialise before touching the ORM
        time.sleep(10)
        while True:
            try:
                from tasks.services.notifications import process_pending_deadline_reminders
                sent = process_pending_deadline_reminders()
                if sent:
                    logger.info(f"[Atlas] Sent {sent} deadline reminder(s).")
            except Exception as e:
                logger.error(f"[Atlas] Reminder loop error: {e}")
            time.sleep(60)  # check every minute
