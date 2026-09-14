Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Pushing Authentic Scrapbook & QR Memory System" -ForegroundColor Cyan
Write-Host " 9x10.9 Kodak Photo Paper Print Studio (300 DPI / 4K)" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Ensuring assets directories exist..." -ForegroundColor Green
if (!(Test-Path "public\assets")) { New-Item -ItemType Directory -Path "public\assets" -Force | Out-Null }
if (!(Test-Path "public\assets\qr")) { New-Item -ItemType Directory -Path "public\assets\qr" -Force | Out-Null }
if (!(Test-Path "docs\assets")) { New-Item -ItemType Directory -Path "docs\assets" -Force | Out-Null }
if (!(Test-Path "docs\assets\qr")) { New-Item -ItemType Directory -Path "docs\assets\qr" -Force | Out-Null }

Write-Host "2. Synchronizing HTML Studios between docs/ and public/..." -ForegroundColor Green
Copy-Item -Path "docs\kodak-print.html" -Destination "public\kodak-print.html" -Force
Copy-Item -Path "docs\new-poster.html" -Destination "public\new-poster.html" -Force

Write-Host "3. Staging modified files..." -ForegroundColor Green
git add -A

Write-Host "4. Committing changes..." -ForegroundColor Green
git commit -m "feat: Restore authentic scrapbook, embedded polaroid apertures, embedded QRs, and transparent storytelling avatars"

Write-Host "5. Setting main branch & pushing to GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " Done! Authentic Scrapbook & Memories pushed to GitHub!" -ForegroundColor Yellow
Write-Host " GitHub Pages URL: https://nandhish3004.github.io/birthday-qr-memory/kodak-print.html" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
