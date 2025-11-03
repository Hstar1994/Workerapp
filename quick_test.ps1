# Simple API Test Commands
# Copy and paste these into PowerShell

# Set variables
$token = "demo-token-1-admin"
$baseUrl = "http://localhost:8000"

Write-Host "`n=== LIST ALL USERS ===" -ForegroundColor Cyan
$users = Invoke-RestMethod -Uri "$baseUrl/api/users/" -Method GET -Headers @{Authorization=$token}
$users | Format-Table id, name, email, role, is_active -AutoSize
Write-Host "Total: $($users.Count) users`n" -ForegroundColor Yellow

# To create a user, uncomment and run:
# $newUser = @{
#     name = "New Test User"
#     email = "newtest@example.com"
#     phone = "555-9999"
#     role = "worker"
#     is_active = $true
# } | ConvertTo-Json
# 
# Invoke-RestMethod -Uri "$baseUrl/api/users/" -Method POST `
#     -Headers @{Authorization=$token; "Content-Type"="application/json"} `
#     -Body $newUser

# To update a user (change ID):
# $updateUser = @{
#     name = "Updated Name"
#     role = "manager"
# } | ConvertTo-Json
# 
# Invoke-RestMethod -Uri "$baseUrl/api/users/8" -Method PUT `
#     -Headers @{Authorization=$token; "Content-Type"="application/json"} `
#     -Body $updateUser

# To view activity logs:
# Invoke-RestMethod -Uri "$baseUrl/api/logs/?limit=10" -Method GET `
#     -Headers @{Authorization=$token} | Format-Table id, action, performer_name, created_at -AutoSize
