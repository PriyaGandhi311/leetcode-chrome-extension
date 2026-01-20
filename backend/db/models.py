from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from datetime import datetime
from typing import Optional

# all db table schema goes here

class User(Base):
    """User model schema - likely to change or updated"""
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    clerk_id = mapped_column(String(255), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Reminder(Base):
    __tablename__ = "reminders"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    # Frontend sends UTC; backend asserts it is UTC and stores as-is
    send_at_utc: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    question_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    leetcode_problem_name: Mapped[str] = mapped_column(String(512), nullable=False)
    leetcode_problem_number: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    user = relationship("User", backref="reminders")