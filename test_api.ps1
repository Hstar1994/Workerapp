# Worker App API Testing Script
# Usage: .\test_api.ps1

$token = "demo-token-1-admin"
$baseUrl = "http://localhost:8000"

Write-Host "`n=== Worker App API Test Script ===" -ForegroundColor Cyan

# Function to list all users
function Get-Users {
    Write-Host "`n--- All Users ---" -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/users/" -Method GET -Headers @{Authorization=$token}
        $response | Format-Table id, name, email, role, is_active -AutoSize
        Write-Host "Total users: $($response.Count)" -ForegroundColor Yellow
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

# Function to create a user
function New-User {
    param(
        [string]$Name,
        [string]$Email,
        [string]$Phone = "",
        [string]$Role = "worker",
        [bool]$IsActive = $true
    )
    
    Write-Host "`n--- Creating User: $Name ---" -ForegroundColor Green
    $body = @{
        name = $Name
        email = $Email
        phone = $Phone
        role = $Role
        is_active = $IsActive
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/users/" -Method POST -Headers @{
            Authorization = $token
            "Content-Type" = "application/json"
        } -Body $body
        Write-Host "✓ User created successfully!" -ForegroundColor Green
        $response | Format-List
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
    }
}

# Function to update a user
function Update-User {
    param(
        [int]$UserId,
        [string]$Name,
        [string]$Email,
        [string]$Phone,
        [string]$Role,
        [bool]$IsActive
    )
    
    Write-Host "`n--- Updating User ID: $UserId ---" -ForegroundColor Green
    $body = @{}
    if ($Name) { $body.name = $Name }
    if ($Email) { $body.email = $Email }
    if ($Phone) { $body.phone = $Phone }
    if ($Role) { $body.role = $Role }
    if ($null -ne $IsActive) { $body.is_active = $IsActive }
    
    $jsonBody = $body | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/users/$UserId" -Method PUT -Headers @{
            Authorization = $token
            "Content-Type" = "application/json"
        } -Body $jsonBody
        Write-Host "✓ User updated successfully!" -ForegroundColor Green
        $response | Format-List
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
    }
}

# Function to delete (deactivate) a user
function Remove-UserAccount {
    param([int]$UserId)
    
    Write-Host "`n--- Deactivating User ID: $UserId ---" -ForegroundColor Green
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/users/$UserId" -Method DELETE -Headers @{Authorization=$token}
        Write-Host "✓ User deactivated successfully!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
    }
}

# Function to get activity logs
function Get-ActivityLogs {
    param(
        [int]$Limit = 10,
        [string]$Action = ""
    )
    
    Write-Host "`n--- Recent Activity Logs ---" -ForegroundColor Green
    $params = "?limit=$Limit"
    if ($Action) { $params += "&action=$Action" }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/logs/$params" -Method GET -Headers @{Authorization=$token}
        $response | Format-Table id, action, performer_name, target_user_name, created_at -AutoSize
        Write-Host "Total logs shown: $($response.Count)" -ForegroundColor Yellow
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

# Main menu
function Show-Menu {
    Write-Host "`n=== Main Menu ===" -ForegroundColor Cyan
    Write-Host "1. List all users"
    Write-Host "2. Create a test user"
    Write-Host "3. Update a user"
    Write-Host "4. Deactivate a user"
    Write-Host "5. View activity logs"
    Write-Host "6. Run full test (create, update, view)"
    Write-Host "Q. Quit"
    Write-Host ""
}

# Full test function
function Run-FullTest {
    Write-Host "`n=== Running Full Test Suite ===" -ForegroundColor Cyan
    
    # List current users
    Get-Users
    
    # Create a new user
    $timestamp = Get-Date -Format "HHmmss"
    New-User -Name "Test User $timestamp" -Email "test$timestamp@example.com" -Phone "555-$timestamp" -Role "worker"
    
    # List users again
    Start-Sleep -Seconds 1
    Get-Users
    
    # View logs
    Get-ActivityLogs -Limit 5
    
    Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
}

# If script is run without parameters, show interactive menu
if ($args.Count -eq 0) {
    while ($true) {
        Show-Menu
        $choice = Read-Host "Enter choice"
        
        switch ($choice) {
            "1" { Get-Users }
            "2" { 
                $name = Read-Host "Enter name"
                $email = Read-Host "Enter email"
                $phone = Read-Host "Enter phone (optional)"
                $role = Read-Host "Enter role (admin/manager/worker)"
                if (-not $role) { $role = "worker" }
                New-User -Name $name -Email $email -Phone $phone -Role $role
            }
            "3" {
                $id = Read-Host "Enter user ID to update"
                $name = Read-Host "Enter new name (or press Enter to skip)"
                $role = Read-Host "Enter new role (admin/manager/worker, or press Enter to skip)"
                Update-User -UserId $id -Name $name -Role $role
            }
            "4" {
                $id = Read-Host "Enter user ID to deactivate"
                Remove-UserAccount -UserId $id
            }
            "5" { Get-ActivityLogs -Limit 20 }
            "6" { Run-FullTest }
            "Q" { return }
            "q" { return }
            default { Write-Host "Invalid choice" -ForegroundColor Red }
        }
    }
} else {
    # Direct command execution
    switch ($args[0]) {
        "list" { Get-Users }
        "test" { Run-FullTest }
        "logs" { Get-ActivityLogs -Limit 20 }
        default { 
            Write-Host "Usage: .\test_api.ps1 [list|test|logs]" -ForegroundColor Yellow
            Write-Host "Or run without parameters for interactive menu" -ForegroundColor Yellow
        }
    }
}
