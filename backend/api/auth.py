from fastapi import APIRouter, Depends
from backend.api.deps import get_current_user
from backend.db.models import User

router = APIRouter()

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the current user profile. 
    The frontend calls this to confirm the user is logged in.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "clerk_id": current_user.clerk_id
    }