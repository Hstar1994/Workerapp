# User Management Guide

This guide shows you how to manage users in the Worker App database.

## Quick Commands

### 1. Dump All Users

```powershell
docker exec workerapp_api python /app/dump_users.py
```

**Output:** Full list of all users with ID, name, email, phone, role, active status, and creation date.

---

### 2. Add a New User

**Basic usage:**
```powershell
docker exec workerapp_api python /app/add_user.py "Full Name" email@example.com role
```

**Examples:**
```powershell
# Add a worker
docker exec workerapp_api python /app/add_user.py "John Doe" john@example.com worker

# Add a manager with phone number
docker exec workerapp_api python /app/add_user.py "Jane Smith" jane@example.com manager --phone "+1234567890"

# Add an admin
docker exec workerapp_api python /app/add_user.py "Admin User" admin2@example.com admin

# Add an inactive user
docker exec workerapp_api python /app/add_user.py "Inactive User" inactive@example.com worker --inactive
```

**Valid roles:**
- `admin` - Full system access
- `manager` - Management access
- `worker` - Worker access

---

### 3. Interactive Menu (PowerShell)

Run the interactive menu script:
```powershell
cd "c:\Worker App1"
.\manage_users.ps1
```

This provides a user-friendly menu to:
1. Dump all users
2. Add users interactively (prompts for each field)
3. Show command examples
4. Exit

---

## Direct Database Access

If you need to run custom SQL queries:

```powershell
# Access the SQLite database directly
docker exec -it workerapp_api sqlite3 /app/data/test.db

# Example queries inside sqlite3:
.headers on
.mode column
SELECT * FROM users;
SELECT email, name, role FROM users WHERE role = 'worker';
.quit
```

---

## Python Scripts Location

The user management scripts are located at:
- `c:\Worker App1\services\api\dump_users.py` - Dump users script
- `c:\Worker App1\services\api\add_user.py` - Add user script

After container restarts, you may need to copy them again:
```powershell
docker cp "c:\Worker App1\services\api\dump_users.py" workerapp_api:/app/dump_users.py
docker cp "c:\Worker App1\services\api\add_user.py" workerapp_api:/app/add_user.py
```

Or rebuild the container to include them permanently (add COPY commands to Dockerfile).

---

## Testing Login

After adding a user, test login via API:

```powershell
# Test login
$response = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login `
  -ContentType application/json -Body '{"email":"test@example.com"}'

# View the token
$response

# Test the /me endpoint
$headers = @{ Authorization = $response.access_token }
Invoke-RestMethod -Uri http://localhost:8080/api/auth/me -Headers $headers
```

Or open http://localhost:8080 in your browser and login with the email (password is ignored in demo mode).

---

## Current Default Users

These users are automatically seeded on first startup:

| Email | Name | Role |
|-------|------|------|
| admin@example.com | Admin | admin |
| manager@example.com | Manager | manager |
| worker1@example.com | Worker One | worker |
| worker2@example.com | Worker Two | worker |
| worker3@example.com | Worker Three | worker |

---

## Troubleshooting

**Error: "User already exists"**
- The email address must be unique. Try a different email.

**Error: "No such file or directory"**
- The scripts need to be copied into the container. Run:
  ```powershell
  docker cp "c:\Worker App1\services\api\dump_users.py" workerapp_api:/app/dump_users.py
  docker cp "c:\Worker App1\services\api\add_user.py" workerapp_api:/app/add_user.py
  ```

**Container not running**
- Start the stack: `docker compose up -d`

**Database file not found**
- The database is automatically created when the API starts. Make sure the API container is running.
