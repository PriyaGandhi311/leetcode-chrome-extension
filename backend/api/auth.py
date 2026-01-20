from fastapi import APIRouter, Depends
from backend.api.authUtils import get_current_user
from backend.db.models import User

router = APIRouter()

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "clerk_id": current_user.clerk_id
    }