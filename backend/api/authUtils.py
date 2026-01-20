import jwt 
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.db.models import User

CLERK_JWKS_URL = "https://legal-dove-96.clerk.accounts.dev/.well-known/jwks.json"
ALGORITHMS = ["RS256"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        jwks_client = jwt.PyJWKClient(CLERK_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
    
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALGORITHMS,
        )
        
        clerk_id = payload.get("sub") 
        email = payload.get("email") 
        
        if not clerk_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.clerk_id == clerk_id).first()
        
        if not user:
            user = User(
                clerk_id=clerk_id,
                email=email or f"unknown_{clerk_id}@clerk.com",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )