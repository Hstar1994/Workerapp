#!/usr/bin/env python3
"""
Dump all users from the database.
Run inside the API container or with DATABASE_URL set.
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add app to path so we can import models
sys.path.insert(0, '/app')
from app.models.models import User

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def dump_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"\n{'='*80}")
        print(f"Total Users: {len(users)}")
        print(f"{'='*80}\n")
        
        if not users:
            print("No users found in database.")
            return
        
        for user in users:
            print(f"ID:     {user.id}")
            print(f"Name:   {user.name}")
            print(f"Email:  {user.email}")
            print(f"Phone:  {user.phone or 'N/A'}")
            print(f"Role:   {user.role}")
            print(f"Active: {user.is_active}")
            print(f"Created: {user.created_at}")
            print("-" * 80)
    finally:
        db.close()

if __name__ == "__main__":
    dump_users()
