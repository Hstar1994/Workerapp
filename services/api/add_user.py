#!/usr/bin/env python3
"""
Add a user to the database.
Run inside the API container or with DATABASE_URL set.

Usage:
  python add_user.py "John Doe" john@example.com worker
  python add_user.py "Jane Manager" jane@example.com manager --phone "+1234567890"
"""
import os
import sys
import argparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add app to path so we can import models
sys.path.insert(0, '/app')
from app.models.models import User

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_user(name, email, role, phone=None, is_active=True):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"❌ Error: User with email '{email}' already exists (ID: {existing.id})")
            return False
        
        # Validate role
        valid_roles = ['admin', 'manager', 'worker']
        if role not in valid_roles:
            print(f"❌ Error: Role must be one of: {', '.join(valid_roles)}")
            return False
        
        # Create new user
        user = User(
            name=name,
            email=email,
            role=role,
            phone=phone,
            is_active=is_active
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ User created successfully!")
        print(f"   ID:     {user.id}")
        print(f"   Name:   {user.name}")
        print(f"   Email:  {user.email}")
        print(f"   Phone:  {user.phone or 'N/A'}")
        print(f"   Role:   {user.role}")
        print(f"   Active: {user.is_active}")
        return True
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating user: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Add a user to the Worker App database')
    parser.add_argument('name', help='Full name of the user')
    parser.add_argument('email', help='Email address (must be unique)')
    parser.add_argument('role', choices=['admin', 'manager', 'worker'], help='User role')
    parser.add_argument('--phone', help='Phone number (optional)', default=None)
    parser.add_argument('--inactive', action='store_true', help='Create user as inactive')
    
    args = parser.parse_args()
    
    add_user(
        name=args.name,
        email=args.email,
        role=args.role,
        phone=args.phone,
        is_active=not args.inactive
    )
