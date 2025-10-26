from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.db import SessionLocal
from app.models.models import User
from app.routers.auth import get_current_user

router = APIRouter()


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[UserResponse])
def get_all_users(current_user: dict = Depends(get_current_user)):
    """
    Get all users. Only accessible by admin users.
    """
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access user list"
        )
    
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.id.asc()).all()
        return users
    finally:
        db.close()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """
    Get a specific user by ID. Admins can view anyone, others can only view themselves.
    """
    # Non-admins can only view their own profile
    if current_user.get("role") != "admin" and current_user.get("id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile"
        )
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    finally:
        db.close()
