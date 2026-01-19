import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from clerk_backend_api import Clerk
from clerk_backend_api.models import AuthenticateRequestOptions

from backend.db.session import get_db
from backend.db.models import User

# Initialize the Security helper and Clerk Client
security = HTTPBearer()

# IMPORTANT: Ensure your .env has CLERK_SECRET_KEY (no VITE_ prefix here)
clerk_client = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    1. Extracts the Bearer token from the request header.
    2. Validates it with Clerk.
    3. Finds or creates the user in the local database.
    """
    token = credentials.credentials
    
    try:
        # Verify the token with Clerk's servers
        request_state = clerk_client.authenticate_request(token=token)
        
        if not request_state.is_signed_in:
             raise HTTPException(status_code=401, detail="Invalid session")

        clerk_id = request_state.payload.get("sub")

        # Look for the user in our local LeetCode Reminder database
        user = db.query(User).filter(User.clerk_id == clerk_id).first()
        
        # If user is logged into Clerk but doesn't exist in our DB yet (First time)
        if not user:
            # Fetch user details from Clerk to get the email
            clerk_user = clerk_client.users.get(clerk_id)
            email = clerk_user.email_addresses[0].email_address
            
            user = User(clerk_id=clerk_id, email=email)
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )