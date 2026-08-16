from django.core.management.base import BaseCommand
from tasks.services.notifications import process_pending_deadline_reminders


class Command(BaseCommand):
    help = "Checks tasks and sends email notifications 15 minutes before their deadline."

    def handle(self, *args, **options):
        self.stdout.write("Checking for pending deadline reminders...")
        sent_count = process_pending_deadline_reminders()
        self.stdout.write(self.style.SUCCESS(f"Successfully sent {sent_count} deadline reminder(s)."))
