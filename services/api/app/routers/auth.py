from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
from typing import Optional

from app.db import SessionLocal, engine, Base
from app.models.models import User

router = APIRouter()

# Seed data we'll ensure exists in the DB for testing
_SEED_USERS = [
    {"email": "admin@example.com", "name": "Admin", "role": "admin"},
    {"email": "manager@example.com", "name": "Manager", "role": "manager"},
    {"email": "worker1@example.com", "name": "Worker One", "role": "worker"},
    {"email": "worker2@example.com", "name": "Worker Two", "role": "worker"},
    {"email": "worker3@example.com", "name": "Worker Three", "role": "worker"},
]


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None  # ignored in stub


class LoginResponse(BaseModel):
    access_token: str
    role: str
    name: str
    user_id: int
    email: str


class MeResponse(BaseModel):
    id: int
    name: str
    role: str
    email: str


def _ensure_db_and_seed():
    """Create tables (if missing) and insert seed users when not present.

    This is intentionally simple for local/dev testing so the SQLite file
    will contain default users which can be persisted by Docker volumes.
    """
    # Create tables if not already created
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Only insert seed users if the users table is empty
        user_count = db.query(User).count()
        if user_count == 0:
            for u in _SEED_USERS:
                user = User(name=u["name"], email=u["email"], role=u["role"])
                db.add(user)
            db.commit()
    finally:
        db.close()


# Ensure seed users exist on import so the DB file is populated for tests
_ensure_db_and_seed()


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == data.email).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        # Return a user-specific demo token that includes the user ID
        return {
            "access_token": f"demo-token-{user.id}-{user.role}",
            "role": user.role,
            "name": user.name,
            "user_id": user.id,
            "email": user.email
        }
    finally:
        db.close()


def get_current_user(authorization: str | None = Header(default=None)):
    token = authorization or "demo-token-1-admin"
    if not token.startswith("demo-token-"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # Extract user ID from token format: demo-token-{id}-{role}
    try:
        parts = token.replace("demo-token-", "").split("-")
        user_id = int(parts[0])
    except (ValueError, IndexError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token/user")
        return {"id": user.id, "name": user.name, "role": user.role, "email": user.email}
    finally:
        db.close()


@router.get("/me", response_model=MeResponse)
def me(current_user: dict = Depends(get_current_user)):
    return current_user
