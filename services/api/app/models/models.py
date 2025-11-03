from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True, nullable=True)
    role = Column(String, nullable=False)  # admin, manager, worker
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Relationships
    assignments = relationship('JobAssignment', back_populates='worker')
    expertise = relationship('WorkerExpertise', back_populates='worker')

class ActivityLog(Base):
    __tablename__ = 'activity_logs'
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)  # e.g., 'user_created', 'user_updated', 'user_deleted', 'worker_assigned', etc.
    description = Column(Text, nullable=False)  # Human-readable description
    performed_by = Column(Integer, ForeignKey('users.id'), nullable=True)  # Who performed the action
    target_user = Column(Integer, ForeignKey('users.id'), nullable=True)  # User affected by the action
    meta_data = Column(JSON, nullable=True)  # Additional data (old values, new values, etc.) - renamed from 'metadata' due to SQLAlchemy reserved word
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    # Relationships
    performer = relationship('User', foreign_keys=[performed_by])
    target = relationship('User', foreign_keys=[target_user])

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    site_address = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    description = Column(Text)
    priority = Column(String, nullable=True)
    planned_start = Column(DateTime(timezone=True), nullable=False)
    planned_end = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False, default='planned')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships
    assignments = relationship('JobAssignment', back_populates='job')
    required_expertise = relationship('JobRequiredExpertise', back_populates='job')
    change_logs = relationship('JobChangeLog', back_populates='job')
    time_entries = relationship('TimeEntry', back_populates='job')
    completion_records = relationship('CompletionRecord', back_populates='job')

    __table_args__ = (
        Index('ix_jobs_planned_start', 'planned_start'),
    )

class JobAssignment(Base):
    __tablename__ = 'job_assignments'
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    worker_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    role_in_job = Column(String, nullable=True)
    # Relationships
    job = relationship('Job', back_populates='assignments')
    worker = relationship('User', back_populates='assignments')

class TimeEntry(Base):
    __tablename__ = 'time_entries'
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    worker_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    # Relationships
    job = relationship('Job', back_populates='time_entries')
    worker = relationship('User')

class JobChangeLog(Base):
    __tablename__ = 'job_change_log'
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    changed_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    field = Column(String, nullable=False)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    reason = Column(Text, nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    # Relationships
    job = relationship('Job', back_populates='change_logs')
    user = relationship('User')

class CompletionRecord(Base):
    __tablename__ = 'completion_records'
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    worker_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    photos_json = Column(JSON, nullable=True)
    client_signature_url = Column(String, nullable=True)
    # Relationships
    job = relationship('Job', back_populates='completion_records')
    worker = relationship('User', foreign_keys=[worker_id])
    approver = relationship('User', foreign_keys=[approved_by])

class Expertise(Base):
    __tablename__ = 'expertise'
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Relationships
    worker_expertise = relationship('WorkerExpertise', back_populates='expertise')
    job_required_expertise = relationship('JobRequiredExpertise', back_populates='expertise')

class WorkerExpertise(Base):
    __tablename__ = 'worker_expertise'
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    expertise_id = Column(Integer, ForeignKey('expertise.id'), nullable=False)
    level = Column(Integer, nullable=False)
    years_experience = Column(Integer, nullable=True)
    verified = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships
    worker = relationship('User', back_populates='expertise')
    expertise = relationship('Expertise', back_populates='worker_expertise')
    __table_args__ = (
        UniqueConstraint('worker_id', 'expertise_id', name='uq_worker_expertise'),
    )

class JobRequiredExpertise(Base):
    __tablename__ = 'job_required_expertise'
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    expertise_id = Column(Integer, ForeignKey('expertise.id'), nullable=False)
    min_level = Column(Integer, nullable=False)
    required = Column(Boolean, default=True)
    # Relationships
    job = relationship('Job', back_populates='required_expertise')
    expertise = relationship('Expertise', back_populates='job_required_expertise')
    __table_args__ = (
        UniqueConstraint('job_id', 'expertise_id', name='uq_job_required_expertise'),
    )
