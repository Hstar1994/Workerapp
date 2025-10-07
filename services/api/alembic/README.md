# Alembic Migrations

This folder contains Alembic migration scripts for the database schema.

## Usage

1. Set your environment variables (see `.env.example`).
2. Run migrations:
   ```
   alembic upgrade head
   ```
3. To create a new migration after model changes:
   ```
   alembic revision --autogenerate -m "describe change"
   ```
