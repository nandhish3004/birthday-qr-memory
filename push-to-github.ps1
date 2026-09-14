Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Pushing Permanent QRs & Supreme Lord Nandhish Realm" -ForegroundColor Cyan
Write-Host " 9x10.9 Kodak Photo Paper Print Engine (300 DPI)" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Ensuring assets directory and docs/ hub exist..." -ForegroundColor Green
if (!(Test-Path "public\assets")) { New-Item -ItemType Directory -Path "public\assets" -Force }
if (!(Test-Path "public\assets\qr")) { New-Item -ItemType Directory -Path "public\assets\qr" -Force }
if (!(Test-Path "docs")) { New-Item -ItemType Directory -Path "docs" -Force }

Write-Host "2. Processing Supreme Lord Nandhish caricature & generating 9x10.9 Kodak prints..." -ForegroundColor Green
try { & "$PSScriptRoot\scripts\prepare-kodak-and-assets.ps1" } catch {}

Write-Host "3. Staging modified files..." -ForegroundColor Green
git add .

Write-Host "4. Committing changes..." -ForegroundColor Green
git commit -m "Update Supreme Lord Nandhish and 9x10.9 Kodak photo print engine (2700x3270 @ 300 DPI)"

Write-Host "5. Setting main branch..." -ForegroundColor Green
git branch -M main

Write-Host "6. Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " Done! Permanent QRs & Animations pushed to GitHub!" -ForegroundColor Yellow
Write-Host " Render will update your live site in ~1 minute!" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
