from celery import Celery
from backend.core.config import settings

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

celery.autodiscover_tasks(["backend.worker"])
