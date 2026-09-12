from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sql_models import User
from app.core.security import create_access_token, verify_password, hash_password
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

class TokenRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str = "INVESTIGATOR"

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(req: TokenRequest, db: Session = Depends(get_db)):
    """Authenticate and obtain JWT bearer token for Module 2 UI."""
    user = db.query(User).filter(User.username == req.username).first()
    if not user:
        # For prototype convenience, auto-create investigator if requested
        if req.username in ("investigator", "admin") and req.password in ("investigator", "admin", "password"):
            user = User(
                username=req.username,
                email=f"{req.username}@police.gov.in",
                hashed_password=hash_password(req.password),
                role="ADMIN" if req.username == "admin" else "INVESTIGATOR"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
            
    access_token = create_access_token(
        data={"sub": user.id, "username": user.username, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return TokenResponse(access_token=access_token, role=user.role)
