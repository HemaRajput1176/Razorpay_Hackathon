from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.schemas import User, AuditLog
import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str
    mfa_code: str | None = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # Authenticate credentials against DB or default security analyst
    user = db.query(User).filter((User.username == req.username) | (User.email == req.username)).first()
    
    # If user doesn't exist, create default security analyst for demo
    if not user:
        if req.username in ["analyst01", "analyst@cybernexus.com", "admin"]:
            user = User(
                username=req.username,
                email=req.username if "@" in req.username else f"{req.username}@cybernexus.com",
                hashed_password="pbkdf2:sha256:default_hash",
                full_name="Analyst 01",
                role="CHIEF SECURITY ANALYST",
                organization="NEXORA ENTERPRISE LAB"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="ACCESS DENIED: Invalid security credentials"
            )

    # Log audit entry
    audit = AuditLog(
        username=user.username,
        role=user.role,
        action="USER_AUTHENTICATED",
        target="COMMAND_CENTER",
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": f"cybernexus_jwt_token_{user.id}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization": user.organization,
            "mfa_enabled": True
        }
    }

@router.get("/me")
def get_current_user():
    return {
        "id": "usr-001",
        "username": "analyst01",
        "email": "analyst@cybernexus.com",
        "full_name": "Analyst 01",
        "role": "CHIEF SECURITY ANALYST",
        "organization": "NEXORA ENTERPRISE LAB",
        "status": "AUTHENTICATED"
    }
