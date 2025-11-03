# ============================================
# Worker App - PowerShell API Test Commands
# ============================================

# Setup (run these first)
$token = "demo-token-1-admin"
$baseUrl = "http://localhost:8000"

# ============================================
# 1. LIST ALL USERS
# ============================================
$users = Invoke-RestMethod -Uri "$baseUrl/api/users/" -Method GET -Headers @{Authorization=$token}
$users | Format-Table id, name, email, role, is_active -AutoSize

# ============================================
# 2. CREATE A NEW USER
# ============================================
$newUser = @{
    name = "New User Name"
    email = "newuser@example.com"
    phone = "555-1234"
    role = "worker"  # Options: worker, manager, admin
    is_active = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/api/users/" -Method POST `
    -Headers @{Authorization=$token; "Content-Type"="application/json"} `
    -Body $newUser | Format-List

# ============================================
# 3. UPDATE A USER (change user ID)
# ============================================
$updateUser = @{
    name = "Updated Name"
    role = "manager"  # Options: worker, manager, admin
    # Add other fields as needed: email, phone, is_active
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/api/users/9" -Method PUT `
    -Headers @{Authorization=$token; "Content-Type"="application/json"} `
    -Body $updateUser | Format-List

# ============================================
# 4. DEACTIVATE A USER (soft delete)
# ============================================
Invoke-RestMethod -Uri "$baseUrl/api/users/9" -Method DELETE `
    -Headers @{Authorization=$token}
Write-Host "User deactivated"

# ============================================
# 5. VIEW ACTIVITY LOGS
# ============================================
$logs = Invoke-RestMethod -Uri "$baseUrl/api/logs/?limit=10" -Method GET `
    -Headers @{Authorization=$token}
$logs | Format-Table id, action, performer_name, target_user_name, created_at -AutoSize

# ============================================
# 6. FULL TEST - Create user and verify
# ============================================
Write-Host "`n=== Creating user..." -ForegroundColor Yellow
$testUser = @{
    name = "Test User $(Get-Date -Format 'HHmmss')"
    email = "test$(Get-Date -Format 'HHmmss')@example.com"
    phone = "555-TEST"
    role = "worker"
    is_active = $true
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri "$baseUrl/api/users/" -Method POST `
    -Headers @{Authorization=$token; "Content-Type"="application/json"} `
    -Body $testUser

Write-Host "✓ Created user ID: $($created.id)" -ForegroundColor Green

Write-Host "`n=== Updating user..." -ForegroundColor Yellow
$update = @{ role = "manager" } | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "$baseUrl/api/users/$($created.id)" -Method PUT `
    -Headers @{Authorization=$token; "Content-Type"="application/json"} `
    -Body $update

Write-Host "✓ Updated user role to: $($updated.role)" -ForegroundColor Green

Write-Host "`n=== Listing all users..." -ForegroundColor Yellow
$allUsers = Invoke-RestMethod -Uri "$baseUrl/api/users/" -Method GET `
    -Headers @{Authorization=$token}
$allUsers | Format-Table id, name, email, role -AutoSize

Write-Host "`n=== Recent activity logs..." -ForegroundColor Yellow
$recentLogs = Invoke-RestMethod -Uri "$baseUrl/api/logs/?limit=5" -Method GET `
    -Headers @{Authorization=$token}
$recentLogs | Format-Table id, action, performer_name, description -Wrap

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
