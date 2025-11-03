from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json

from app.db import SessionLocal
from app.models.models import User, ActivityLog
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


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


def log_activity(db, action: str, description: str, performed_by: int, target_user: int = None, metadata: dict = None):
    """Helper function to create activity log entries"""
    log = ActivityLog(
        action=action,
        description=description,
        performed_by=performed_by,
        target_user=target_user,
        meta_data=metadata  # Using meta_data column (metadata is reserved in SQLAlchemy)
    )
    db.add(log)
    db.commit()


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


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    """
    Create a new user. Only accessible by admin users.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create users"
        )
    
    # Validate role
    valid_roles = ['admin', 'manager', 'worker']
    if user_data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    db = SessionLocal()
    try:
        # Check if email already exists
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            role=user_data.role,
            is_active=user_data.is_active
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Log the activity
        log_activity(
            db=db,
            action="user_created",
            description=f"{current_user['name']} created user {new_user.name} ({new_user.role})",
            performed_by=current_user['id'],
            target_user=new_user.id,
            metadata={"email": new_user.email, "role": new_user.role}
        )
        
        # Refresh the user object to re-attach it to the session after log_activity commits
        db.refresh(new_user)
        
        return new_user
    finally:
        db.close()


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """
    Update a user. Only accessible by admin users.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update users"
        )
    
    # Validate role if provided
    if user_data.role:
        valid_roles = ['admin', 'manager', 'worker']
        if user_data.role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Track changes for logging
        changes = {}
        old_values = {}
        
        # Update fields
        if user_data.name is not None and user_data.name != user.name:
            old_values['name'] = user.name
            user.name = user_data.name
            changes['name'] = user_data.name
        
        if user_data.email is not None and user_data.email != user.email:
            # Check if new email is already taken
            existing = db.query(User).filter(User.email == user_data.email, User.id != user_id).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            old_values['email'] = user.email
            user.email = user_data.email
            changes['email'] = user_data.email
        
        if user_data.phone is not None and user_data.phone != user.phone:
            old_values['phone'] = user.phone
            user.phone = user_data.phone
            changes['phone'] = user_data.phone
        
        if user_data.role is not None and user_data.role != user.role:
            old_values['role'] = user.role
            user.role = user_data.role
            changes['role'] = user_data.role
        
        if user_data.is_active is not None and user_data.is_active != user.is_active:
            old_values['is_active'] = user.is_active
            user.is_active = user_data.is_active
            changes['is_active'] = user_data.is_active
        
        db.commit()
        db.refresh(user)
        
        # Log the activity if there were changes
        if changes:
            change_descriptions = [f"{k}: {old_values[k]} → {v}" for k, v in changes.items()]
            log_activity(
                db=db,
                action="user_updated",
                description=f"{current_user['name']} updated user {user.name}: {', '.join(change_descriptions)}",
                performed_by=current_user['id'],
                target_user=user.id,
                metadata={"changes": changes, "old_values": old_values}
            )
            
            # Refresh the user object to re-attach it to the session after log_activity commits
            db.refresh(user)
        
        return user
    finally:
        db.close()


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """
    Delete (deactivate) a user. Only accessible by admin users.
    Note: This sets is_active to False rather than actually deleting the record.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete users"
        )
    
    # Prevent self-deletion
    if user_id == current_user['id']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = False
        db.commit()
        
        # Log the activity
        log_activity(
            db=db,
            action="user_deactivated",
            description=f"{current_user['name']} deactivated user {user.name}",
            performed_by=current_user['id'],
            target_user=user.id,
            metadata={"email": user.email, "role": user.role}
        )
        
        return None
    finally:
        db.close()
