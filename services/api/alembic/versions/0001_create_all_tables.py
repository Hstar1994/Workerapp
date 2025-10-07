"""
Initial migration: create all tables for Worker App MVP
"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('phone', sa.String(), unique=True),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table('jobs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('site_address', sa.String(), nullable=False),
        sa.Column('client_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('priority', sa.String()),
        sa.Column('planned_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('planned_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='planned'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index('ix_jobs_planned_start', 'jobs', ['planned_start'])
    op.create_table('job_assignments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id'), nullable=False),
        sa.Column('worker_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role_in_job', sa.String()),
    )
    op.create_table('time_entries',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id'), nullable=False),
        sa.Column('worker_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True)),
        sa.Column('notes', sa.Text()),
    )
    op.create_table('job_change_log',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id'), nullable=False),
        sa.Column('changed_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('field', sa.String(), nullable=False),
        sa.Column('old_value', sa.String()),
        sa.Column('new_value', sa.String()),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table('completion_records',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id'), nullable=False),
        sa.Column('worker_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('approved_by', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('approved_at', sa.DateTime(timezone=True)),
        sa.Column('photos_json', sa.JSON()),
        sa.Column('client_signature_url', sa.String()),
    )
    op.create_table('expertise',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('key', sa.String(), nullable=False, unique=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category', sa.String()),
        sa.Column('description', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table('worker_expertise',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('worker_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('expertise_id', sa.Integer(), sa.ForeignKey('expertise.id'), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('years_experience', sa.Integer()),
        sa.Column('verified', sa.Boolean(), default=False),
        sa.Column('notes', sa.Text()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.UniqueConstraint('worker_id', 'expertise_id', name='uq_worker_expertise'),
    )
    op.create_table('job_required_expertise',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id'), nullable=False),
        sa.Column('expertise_id', sa.Integer(), sa.ForeignKey('expertise.id'), nullable=False),
        sa.Column('min_level', sa.Integer(), nullable=False),
        sa.Column('required', sa.Boolean(), default=True),
        sa.UniqueConstraint('job_id', 'expertise_id', name='uq_job_required_expertise'),
    )

def downgrade():
    op.drop_table('job_required_expertise')
    op.drop_table('worker_expertise')
    op.drop_table('expertise')
    op.drop_table('completion_records')
    op.drop_table('job_change_log')
    op.drop_table('time_entries')
    op.drop_table('job_assignments')
    op.drop_index('ix_jobs_planned_start', table_name='jobs')
    op.drop_table('jobs')
    op.drop_table('users')
