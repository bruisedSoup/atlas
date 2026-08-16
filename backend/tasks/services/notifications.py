import datetime
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from tasks.models import Task


def send_deadline_reminder_email(task: Task) -> bool:
    """
    Sends an HTML notification to the user's registered Gmail address
    15 minutes before the task deadline.
    """
    user_email = task.user.email
    if not user_email:
        return False

    user_name = task.user.full_name or "Student"
    time_display = task.deadline_time.strftime("%I:%M %p") if task.deadline_time else "End of day"
    date_display = task.deadline_date.strftime("%B %d, %Y") if task.deadline_date else "Today"

    subject = f"⏰ [Atlas] Reminder: \"{task.title}\" is due in 15 minutes!"
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 24px;
          color: #1e293b;
        }}
        .container {{
          max-width: 520px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          padding: 32px 28px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }}
        .header {{
          text-align: center;
          margin-bottom: 24px;
        }}
        .brand {{
          font-family: 'Georgia', serif;
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: #0f172a;
          margin: 0;
        }}
        .badge {{
          display: inline-block;
          background-color: #fef08a;
          color: #854d0e;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-top: 8px;
        }}
        .card {{
          background-color: #f8fafc;
          border: 1.5px dashed #cbd5e1;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }}
        .task-title {{
          font-family: 'Georgia', serif;
          font-size: 1.35rem;
          font-style: italic;
          color: #0f172a;
          margin: 0 0 10px 0;
        }}
        .due-info {{
          font-size: 0.9rem;
          color: #475569;
          margin: 4px 0;
        }}
        .btn {{
          display: block;
          text-align: center;
          background-color: #0f172a;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          margin-top: 24px;
        }}
        .footer {{
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 24px;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand">✦ ATLAS</h1>
          <span class="badge">15-MINUTE DEADLINE ALERT</span>
        </div>

        <p>Hello <strong>{user_name}</strong>,</p>
        <p>This is a quick reminder that one of your deliverables is due in <strong>15 minutes</strong>:</p>

        <div class="card">
          <h2 class="task-title">{task.title}</h2>
          <p class="due-info">⏰ <strong>Deadline:</strong> {date_display} at {time_display}</p>
          {f'<p class="due-info">📝 <strong>Notes:</strong> {task.description}</p>' if task.description else ''}
        </div>

        <a href="http://localhost:3000/dashboard" class="btn">Open Work Hub</a>

        <div class="footer">
          <p>You received this email because deadline notifications are enabled for this task on Atlas.</p>
        </div>
      </div>
    </body>
    </html>
    """

    plain_message = f"Hello {user_name},\n\nYour task '{task.title}' is due in 15 minutes at {time_display} on {date_display}.\n\nOpen your Work Hub: http://localhost:3000/dashboard\n\n- Atlas Team"

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        task.reminder_sent = True
        task.save(update_fields=["reminder_sent"])
        return True
    except Exception as e:
        print(f"Error sending deadline notification for task {task.id}: {e}")
        return False


def process_pending_deadline_reminders():
    """
    Checks for tasks due within the next 15 minutes that haven't had reminders sent.
    """
    now = timezone.now()
    # Consider tasks due between now and now + 16 minutes
    today = now.date()

    candidates = Task.objects.filter(
        status="ongoing",
        notify_before_deadline=True,
        reminder_sent=False,
        deadline_date__isnull=False,
    )

    sent_count = 0
    for task in candidates:
        deadline_time = task.deadline_time or datetime.time(23, 59, 59)
        # Create naive datetime and make aware in current timezone
        task_dt = datetime.datetime.combine(task.deadline_date, deadline_time)
        task_aware = timezone.make_aware(task_dt, timezone.get_current_timezone())

        # Difference in minutes
        delta_seconds = (task_aware - now).total_seconds()
        # Trigger if due within 15 minutes (or up to 1 minute overdue if worker ran slightly late)
        if -60 <= delta_seconds <= 900:
            if send_deadline_reminder_email(task):
                sent_count += 1

    return sent_count
