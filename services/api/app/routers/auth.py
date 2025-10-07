from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Demo users for stub
SEED_USERS = {
    "admin@example.com": {"id": 1, "name": "Admin", "role": "admin"},
    "manager@example.com": {"id": 2, "name": "Manager", "role": "manager"},
    "worker1@example.com": {"id": 3, "name": "Worker One", "role": "worker"},
    "worker2@example.com": {"id": 4, "name": "Worker Two", "role": "worker"},
    "worker3@example.com": {"id": 5, "name": "Worker Three", "role": "worker"},
}

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None  # ignored in stub

class LoginResponse(BaseModel):
    access_token: str
    role: str
    name: str

class MeResponse(BaseModel):
    id: int
    name: str
    role: str
    email: str

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    user = SEED_USERS.get(data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    # Return a fixed token for demo
    return {
        "access_token": f"demo-token-for-{user['role']}",
        "role": user["role"],
        "name": user["name"]
    }

# Dependency to get current user from token (stub)
def get_current_user(authorization: str | None = Header(default=None)):
    token = authorization or "demo-token-for-worker"
    for email, user in SEED_USERS.items():
        if token == f"demo-token-for-{user['role']}":
            return {**user, "email": email}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@router.get("/me", response_model=MeResponse)
def me(current_user: dict = Depends(get_current_user)):
    return current_user
