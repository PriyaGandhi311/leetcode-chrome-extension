from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user
from backend.core.config import settings
from backend.core.security import hash_password, verify_password, create_access_token
from backend.db.models import User
from backend.db.session import get_db

router = APIRouter()

class LoginOrSignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeResponse(BaseModel):
    id: int
    email: EmailStr

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).one_or_none()

@router.post("/signup", response_model=MeResponse)
def signup(payload: LoginOrSignupRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    if get_user_by_email(db, email):
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return MeResponse(id=user.id, email=user.email)

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginOrSignupRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    user = get_user_by_email(db, email)

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")

    token = create_access_token(
        subject=str(user.id),
        secret=settings.jwt_secret,
        alg=settings.jwt_alg,
        expires_minutes=settings.access_token_expire_minutes,
    )
    return AuthResponse(access_token=token)

@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)):
    return MeResponse(id=user.id, email=user.email)

# DEV ONLY: list all users
@router.get("/_debug/users", response_model=List[MeResponse])
def debug_list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id.asc()).all()
    return [MeResponse(id=u.id, email=u.email) for u in users]
