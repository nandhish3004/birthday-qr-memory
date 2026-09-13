Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Pushing Updates to GitHub: nandhish3004" -ForegroundColor Cyan
Write-Host " Cute Stranger Things + Retro Windows OS + Guru" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Staging files..." -ForegroundColor Green
git add .

Write-Host "2. Committing changes..." -ForegroundColor Green
git commit -m "Cute Stranger Things, Retro Windows OS aesthetic, and Sarcastic Guru companion"

Write-Host "3. Setting main branch..." -ForegroundColor Green
git branch -M main

Write-Host "4. Linking remote if needed..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin https://github.com/nandhish3004/birthday-qr-memory.git

Write-Host "5. Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " Done! Render will auto-rebuild in ~1 minute!" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
Read-Host -Prompt "Press Enter to exit"
