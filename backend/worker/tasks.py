from datetime import datetime, timezone
from sqlalchemy import and_
from sqlalchemy.orm import Session
from celery import shared_task

from backend.db.session import SessionLocal
from backend.db.models import Reminder, User
from backend.core.email import send_email

@shared_task(name="backend.worker.tasks.dispatch_due_reminders")
def dispatch_due_reminders():
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # Lock due rows so multiple workers don't double-send
        due = (
            db.query(Reminder)
            .filter(
                and_(
                    Reminder.is_active == True,
                    Reminder.sent_at.is_(None),
                    Reminder.send_at_utc <= now,
                )
            )
            .order_by(Reminder.send_at_utc.asc())
            .with_for_update(skip_locked=True)
            .limit(200)
            .all()
        )

        sent_count = 0

        for r in due:
            user = db.query(User).filter(User.id == r.user_id).one_or_none()
            if not user or not user.is_active:
                r.is_active = False
                continue

            subject = "LeetCode Reminder"
            body = (
                f"Time to solve LeetCode #{r.leetcode_problem_number}: {r.leetcode_problem_name}\n\n"
                f"{r.question_url}\n"
            )

            send_email(to_email=user.email, subject=subject, body=body)

            r.sent_at = now
            r.is_active = False
            sent_count += 1

        db.commit()
        return {"sent": sent_count}
    finally:
        db.close()
