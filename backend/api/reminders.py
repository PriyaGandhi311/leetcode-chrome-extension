from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

# Import the new Clerk-based dependency
from backend.api.deps import get_current_user
from backend.db.session import get_db
from backend.db.models import Reminder, User

router = APIRouter()

def _assert_utc(dt: datetime) -> datetime:
    # We require timezone-aware UTC datetimes
    if dt.tzinfo is None:
        raise HTTPException(status_code=400, detail="send_at_utc must include timezone (UTC)")
    if dt.utcoffset() != timedelta(0):
        raise HTTPException(status_code=400, detail="send_at_utc must be UTC (offset +00:00)")
    return dt

# --- Pydantic Schemas ---

class ReminderCreate(BaseModel):
    send_at_utc: datetime
    question_url: HttpUrl
    leetcode_problem_name: str
    leetcode_problem_number: int

class ReminderOut(BaseModel):
    id: int
    send_at_utc: datetime
    question_url: HttpUrl
    leetcode_problem_name: str
    leetcode_problem_number: int
    is_active: bool
    sent_at: datetime | None

class ReminderToggle(BaseModel):
    is_active: bool

# --- Routes ---

@router.post("", response_model=ReminderOut)
def create_reminder(
    payload: ReminderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user), # Injected from Clerk token
):
    send_at = _assert_utc(payload.send_at_utc)

    r = Reminder(
        user_id=user.id, # Uses the local DB integer ID found/created by Clerk
        send_at_utc=send_at,
        question_url=str(payload.question_url),
        leetcode_problem_name=payload.leetcode_problem_name,
        leetcode_problem_number=payload.leetcode_problem_number,
        is_active=True,
        sent_at=None,
    )
    db.add(r)
    db.commit()
    db.refresh(r)

    return r

@router.get("", response_model=List[ReminderOut])
def list_reminders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Only fetch reminders belonging to the authenticated Clerk user
    return (
        db.query(Reminder)
        .filter(Reminder.user_id == user.id)
        .order_by(Reminder.id.desc())
        .all()
    )

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
    return r

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