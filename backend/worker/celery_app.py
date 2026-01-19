from celery import Celery
from backend.core.config import settings
from celery.schedules import crontab

celery = Celery(
    "leetcode_reminder",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery.conf.timezone = "UTC"

# Run dispatcher every 30 seconds
celery.conf.beat_schedule = {
    "dispatch-due-reminders": {
        "task": "backend.worker.tasks.dispatch_due_reminders",
        "schedule": 30.0,
    }
}

celery.conf.beat_schedule.update({
    "cleanup-old-sent-reminders-3am-utc": {
        "task": "backend.worker.tasks.cleanup_old_sent_reminders",
        "schedule": crontab(hour=3, minute=0),
        "args": (30,),
    }
})

celery.autodiscover_tasks(["backend.worker"])
