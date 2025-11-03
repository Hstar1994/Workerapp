from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db import SessionLocal
from app.models.models import ActivityLog, User
from app.routers.auth import get_current_user

router = APIRouter()


class ActivityLogResponse(BaseModel):
    id: int
    action: str
    description: str
    performed_by: int | None
    performer_name: str | None
    target_user: int | None
    target_user_name: str | None
    metadata: dict | None
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ActivityLogResponse])
def get_activity_logs(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    action: Optional[str] = None
):
    """
    Get activity logs. Only accessible by admin users.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view activity logs"
        )
    
    db = SessionLocal()
    try:
        query = db.query(ActivityLog)
        
        # Filter by action if provided
        if action:
            query = query.filter(ActivityLog.action == action)
        
        # Order by most recent first
        query = query.order_by(ActivityLog.created_at.desc())
        
        # Apply pagination
        logs = query.offset(offset).limit(limit).all()
        
        # Enrich with user names
        result = []
        for log in logs:
            log_dict = {
                "id": log.id,
                "action": log.action,
                "description": log.description,
                "performed_by": log.performed_by,
                "performer_name": None,
                "target_user": log.target_user,
                "target_user_name": None,
                "metadata": log.meta_data,  # Using meta_data column
                "created_at": log.created_at
            }
            
            # Get performer name
            if log.performed_by:
                performer = db.query(User).filter(User.id == log.performed_by).first()
                if performer:
                    log_dict["performer_name"] = performer.name
            
            # Get target user name
            if log.target_user:
                target = db.query(User).filter(User.id == log.target_user).first()
                if target:
                    log_dict["target_user_name"] = target.name
            
            result.append(log_dict)
        
        return result
    finally:
        db.close()
