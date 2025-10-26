# PowerShell helper script to manage users in the Worker App
# Run from: C:\Worker App1

Write-Host "Worker App - User Management Helper" -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

function Show-Menu {
    Write-Host "1. Dump all users" -ForegroundColor Green
    Write-Host "2. Add a new user (interactive)" -ForegroundColor Green
    Write-Host "3. Add a new user (command)" -ForegroundColor Green
    Write-Host "4. Exit`n" -ForegroundColor Green
}

function Dump-Users {
    Write-Host "`nFetching users from database..." -ForegroundColor Yellow
    docker exec workerapp_api python /app/dump_users.py
}

function Add-UserInteractive {
    Write-Host "`n--- Add New User ---" -ForegroundColor Cyan
    $name = Read-Host "Enter full name"
    $email = Read-Host "Enter email"
    $role = Read-Host "Enter role (admin/manager/worker)"
    $phone = Read-Host "Enter phone (optional, press Enter to skip)"
    
    $cmd = "python /app/add_user.py `"$name`" `"$email`" $role"
    if ($phone) {
        $cmd += " --phone `"$phone`""
    }
    
    Write-Host "`nAdding user..." -ForegroundColor Yellow
    docker exec workerapp_api sh -c $cmd
}

function Show-AddUserHelp {
    Write-Host "`nAdd user command examples:" -ForegroundColor Cyan
    Write-Host "docker exec workerapp_api python /app/add_user.py ""John Doe"" john@example.com worker" -ForegroundColor White
    Write-Host "docker exec workerapp_api python /app/add_user.py ""Jane Smith"" jane@example.com manager --phone ""+1234567890""" -ForegroundColor White
    Write-Host ""
}

while ($true) {
    Show-Menu
    $choice = Read-Host "Select option"
    
    switch ($choice) {
        "1" { Dump-Users }
        "2" { Add-UserInteractive }
        "3" { Show-AddUserHelp }
        "4" { 
            Write-Host "Goodbye!" -ForegroundColor Green
            exit 
        }
        default { Write-Host "Invalid option. Please try again.`n" -ForegroundColor Red }
    }
    
    Write-Host "`nPress Enter to continue..." -ForegroundColor Gray
    Read-Host
    Clear-Host
}
