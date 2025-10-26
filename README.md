# Worker App

A full-stack contracting worker scheduler application with FastAPI backend and React frontend.

## 📋 Overview

- **Frontend**: React + Vite served by Nginx on http://localhost:8080
- **Backend**: FastAPI on http://localhost:8000
- **Database**: SQLite with persistent Docker volume storage
- **Authentication**: Demo token-based auth with seeded users

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (localhost:8080)                                   │
│  ↓                                                           │
│  Nginx (web container)                                      │
│  ├─ Serves: React SPA from /services/web/dist              │
│  └─ Proxies: /api/* → FastAPI (api container)              │
│                                                              │
│  FastAPI (api container - localhost:8000)                   │
│  ├─ Routes: /api/auth/login, /api/auth/me, /healthz        │
│  ├─ Models: User, Job, JobAssignment, TimeEntry, etc.      │
│  └─ DB: SQLite at /app/data/test.db (persisted volume)     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- PowerShell (Windows) or equivalent terminal

### Start the Application

```powershell
# Navigate to project root
cd "c:\Worker App1"

# Start all services (builds if needed)
docker compose up -d --build

# Check status
docker compose ps
```

### Access the Application

- **Web UI**: http://localhost:8080
- **API Health Check**: http://localhost:8000/healthz
- **API Docs**: http://localhost:8000/docs (FastAPI auto-generated)

### Stop the Application

```powershell
# Stop containers (keeps data)
docker compose down

# Stop and remove volumes (deletes database)
docker compose down -v
```

## 👤 User Authentication

### Default Users

The following users are automatically seeded on first startup:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@example.com | _(ignored)_ | admin | Full system access |
| manager@example.com | _(ignored)_ | manager | Management access |
| worker1@example.com | _(ignored)_ | worker | Worker access |
| worker2@example.com | _(ignored)_ | worker | Worker access |
| worker3@example.com | _(ignored)_ | worker | Worker access |

**Note**: Password field is ignored in demo mode. Login with email only.

### Login via Web UI

1. Open http://localhost:8080
2. Click "Login"
3. Enter any email from the table above
4. Password field can be left empty or any value

### Login via API

```powershell
# Login request
$response = Invoke-RestMethod -Method Post `
  -Uri http://localhost:8080/api/auth/login `
  -ContentType application/json `
  -Body '{"email":"admin@example.com"}'

# Response contains: access_token, role, name
$response

# Use token to access protected endpoints
$headers = @{ Authorization = $response.access_token }
Invoke-RestMethod -Uri http://localhost:8080/api/auth/me -Headers $headers
```

## 🗄️ Database Management

### View All Users

```powershell
# Copy scripts into container (if not already done)
docker cp "c:\Worker App1\services\api\dump_users.py" workerapp_api:/app/dump_users.py
docker cp "c:\Worker App1\services\api\add_user.py" workerapp_api:/app/add_user.py

# Dump all users
docker exec workerapp_api python /app/dump_users.py

# Compact view
docker exec workerapp_api python /app/dump_users.py | Select-String -Pattern "Total Users|ID:|Name:|Email:|Role:"
```

### Add New Users

```powershell
# Basic syntax
docker exec workerapp_api python /app/add_user.py "Full Name" email@example.com role

# Examples
docker exec workerapp_api python /app/add_user.py "John Doe" john@example.com worker
docker exec workerapp_api python /app/add_user.py "Jane Smith" jane@example.com manager --phone "+1234567890"
docker exec workerapp_api python /app/add_user.py "Admin Two" admin2@example.com admin

# Create inactive user
docker exec workerapp_api python /app/add_user.py "Inactive User" inactive@example.com worker --inactive
```

**Valid roles**: `admin`, `manager`, `worker`

### Interactive User Management

```powershell
cd "c:\Worker App1"
.\manage_users.ps1
```

Provides a menu-driven interface to:
1. Dump all users
2. Add users interactively
3. View command examples

### Direct Database Access

```powershell
# Access SQLite shell
docker exec -it workerapp_api sqlite3 /app/data/test.db

# Example queries (inside sqlite3)
.headers on
.mode column
SELECT * FROM users;
SELECT email, name, role FROM users WHERE role = 'worker';
.quit
```

## 🛠️ Development Commands

### Rebuild Specific Service

```powershell
# Rebuild API only
docker compose build api
docker compose up -d api

# Rebuild frontend
cd "c:\Worker App1\services\web"
npm run build
docker compose restart web
```

### View Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web

# Last 100 lines
docker logs workerapp_api --tail 100
```

### Restart Services

```powershell
# Restart all
docker compose restart

# Restart specific service
docker compose restart api
docker compose restart web
```

### Check Running Containers

```powershell
docker compose ps
docker ps
```

### Inspect Volumes

```powershell
# List volumes
docker volume ls

# Inspect data volume
docker volume inspect workerapp1_data_volume

# Check database file inside container
docker exec workerapp_api ls -la /app/data/
```

## 📁 Project Structure

```
c:\Worker App1/
├── docker-compose.yml          # Docker services configuration
├── README.md                   # This file
├── USER_MANAGEMENT.md          # Detailed user management guide
├── manage_users.ps1            # Interactive user management script
├── start_api.py               # API startup script (legacy)
│
├── services/
│   ├── api/                   # FastAPI backend
│   │   ├── Dockerfile
│   │   ├── requirements.txt   # Python dependencies
│   │   ├── dump_users.py      # User dump utility
│   │   ├── add_user.py        # User creation utility
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py        # FastAPI app entry point
│   │   │   ├── db.py          # Database configuration
│   │   │   ├── models/
│   │   │   │   └── models.py  # SQLAlchemy models
│   │   │   └── routers/
│   │   │       └── auth.py    # Authentication endpoints
│   │   └── alembic/           # Database migrations
│   │       ├── alembic.ini
│   │       ├── env.py
│   │       └── versions/
│   │           └── 0001_create_all_tables.py
│   │
│   └── web/                   # React frontend
│       ├── package.json       # Node dependencies
│       ├── vite.config.js     # Vite configuration
│       ├── nginx.conf         # Nginx proxy configuration
│       ├── index.html
│       ├── src/
│       │   ├── main.jsx       # React app entry point
│       │   └── pages/
│       │       ├── auth/
│       │       │   └── Login.jsx
│       │       ├── Dashboard.jsx
│       │       ├── Home.jsx
│       │       └── UserManagement.jsx
│       └── dist/              # Built assets (generated)
│
└── ai/                        # AI prompts and adapters
    ├── adapter.py
    └── prompts/
```

## 🔧 Configuration

### Environment Variables

The API service uses these environment variables (set in docker-compose.yml):

- `DATABASE_URL`: SQLite connection string
  - Default: `sqlite:////app/data/test.db`
  - Persisted in Docker volume `data_volume`

### Ports

- **8080**: Nginx web server (public interface)
- **8000**: FastAPI backend (direct access for testing)

### Volumes

- `data_volume`: Persistent storage for SQLite database
  - Container path: `/app/data`
  - Contains: `test.db` (SQLite database file)

## 🧪 Testing

### API Health Check

```powershell
# Direct API
Invoke-RestMethod -Uri http://localhost:8000/healthz

# Through Nginx proxy
Invoke-RestMethod -Uri http://localhost:8080/healthz
```

### Test Authentication Flow

```powershell
# 1. Login
$login = Invoke-RestMethod -Method Post `
  -Uri http://localhost:8080/api/auth/login `
  -ContentType application/json `
  -Body '{"email":"worker1@example.com"}'

# 2. Check token
$login

# 3. Get user info
$headers = @{ Authorization = $login.access_token }
$user = Invoke-RestMethod -Uri http://localhost:8080/api/auth/me -Headers $headers
$user
```

### Verify Data Persistence

```powershell
# 1. Add a test user
docker exec workerapp_api python /app/add_user.py "Persistence Test" persist@test.com worker

# 2. Restart API container
docker compose restart api

# 3. Verify user still exists
docker exec workerapp_api python /app/dump_users.py | Select-String "persist@test.com"
```

## 🐛 Troubleshooting

### Docker Desktop Not Running

```powershell
# Error: "cannot find the file specified"
# Solution: Start Docker Desktop manually or run:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker to be ready, then:
docker compose up -d
```

### API Container Fails to Start

```powershell
# Check logs
docker logs workerapp_api

# Common issues:
# - Missing dependencies: Rebuild with `docker compose build api`
# - Port conflict: Check if port 8000 is in use
```

### Scripts Not Found in Container

```powershell
# Copy scripts into running container
docker cp "c:\Worker App1\services\api\dump_users.py" workerapp_api:/app/dump_users.py
docker cp "c:\Worker App1\services\api\add_user.py" workerapp_api:/app/add_user.py
```

### Web UI Not Loading

```powershell
# Check if frontend is built
ls "c:\Worker App1\services\web\dist"

# Rebuild frontend
cd "c:\Worker App1\services\web"
npm install
npm run build
docker compose restart web
```

### Database Issues

```powershell
# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d --build

# Default users will be reseeded automatically
```

## 📚 Additional Documentation

- **[USER_MANAGEMENT.md](USER_MANAGEMENT.md)**: Detailed user management guide with advanced examples
- **API Documentation**: http://localhost:8000/docs (when API is running)

## 🔐 Security Notes

⚠️ **This is a demo/development setup**:
- Passwords are NOT validated (any value accepted)
- Tokens are simple demo strings (`demo-token-for-{role}`)
- No password hashing or proper authentication
- Not suitable for production use

For production, implement:
- Proper password hashing (bcrypt, argon2)
- JWT tokens with expiration
- HTTPS/TLS encryption
- Environment-based secrets management
- Role-based access control (RBAC)

## 📝 License

This is a local proof of concept project.
