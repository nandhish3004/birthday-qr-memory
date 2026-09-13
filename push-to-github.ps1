Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Pushing Birthday QR Memory System to GitHub" -ForegroundColor Cyan
Write-Host " GitHub Account: nandhish3004" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Initializing Git repository..." -ForegroundColor Green
git init

Write-Host "2. Staging all files..." -ForegroundColor Green
git add .

Write-Host "3. Committing files..." -ForegroundColor Green
git commit -m "Complete Birthday QR-Code Memory System for Shaaaw"

Write-Host "4. Setting main branch..." -ForegroundColor Green
git branch -M main

Write-Host "5. Setting remote origin to https://github.com/nandhish3004/birthday-qr-memory.git..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin https://github.com/nandhish3004/birthday-qr-memory.git

Write-Host "6. Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " Done! If your repo isn't created yet, create it at:" -ForegroundColor Yellow
Write-Host " https://github.com/new (Name: birthday-qr-memory)" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
Read-Host -Prompt "Press Enter to exit"
