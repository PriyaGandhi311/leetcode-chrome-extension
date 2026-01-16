from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user
from backend.db.session import get_db
from backend.db.models import Reminder, User

"""
    TODO: add docs/ swagger description for APIs
    For now have just commented the APIs
"""

router = APIRouter()

def _assert_utc(dt: datetime) -> datetime:
    # We require timezone-aware UTC datetimes
    if dt.tzinfo is None:
        raise HTTPException(status_code=400, detail="send_at_utc must include timezone (UTC)")
    if dt.utcoffset() != timedelta(0):
        raise HTTPException(status_code=400, detail="send_at_utc must be UTC (offset +00:00)")
    return dt

# json payload schema for creating a reminder
class ReminderCreate(BaseModel):
    send_at_utc: datetime
    question_url: HttpUrl

# json response schema for a reminder
class ReminderOut(BaseModel):
    id: int
    send_at_utc: datetime
    question_url: HttpUrl
    is_active: bool
    sent_at: datetime | None

# json payload schema for toggling a reminder
class ReminderToggle(BaseModel):
    is_active: bool

# create a new reminder, takes in a ReminderCreate payload and returns a ReminderOut
@router.post("", response_model=ReminderOut)
def create_reminder(
    payload: ReminderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    send_at = _assert_utc(payload.send_at_utc)

    r = Reminder(
        user_id=user.id,
        send_at_utc=send_at,
        question_url=str(payload.question_url),
        is_active=True,
        sent_at=None,
    )
    db.add(r)
    db.commit()
    db.refresh(r)

    return ReminderOut(
        id=r.id,
        send_at_utc=r.send_at_utc,
        question_url=r.question_url,
        is_active=r.is_active,
        sent_at=r.sent_at,
    )

# list all reminders for the current user, takes in no params and returns a list of ReminderOut
@router.get("", response_model=List[ReminderOut])
def list_reminders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = (
        db.query(Reminder)
        .filter(Reminder.user_id == user.id)
        .order_by(Reminder.id.desc())
        .all()
    )

    return [
        ReminderOut(
            id=r.id,
            send_at_utc=r.send_at_utc,
            question_url=r.question_url,
            is_active=r.is_active,
            sent_at=r.sent_at,
        )
        for r in rows
    ]

# toggle a reminder, takes in a ReminderToggle payload and returns a modified ReminderOut
@router.patch("/{reminder_id}", response_model=ReminderOut)
def toggle_reminder(
    reminder_id: int,
    payload: ReminderToggle,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user.id)
        .one_or_none()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Reminder not found")

    r.is_active = payload.is_active
    db.commit()
    db.refresh(r)

    return ReminderOut(
        id=r.id,
        send_at_utc=r.send_at_utc,
        question_url=r.question_url,
        is_active=r.is_active,
        sent_at=r.sent_at,
    )

# delete a reminder, takes in no params and returns a confirmation
@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user.id)
        .one_or_none()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Reminder not found")

    db.delete(r)
    db.commit()
    return {"ok": True}