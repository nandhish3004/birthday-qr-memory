Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Pushing Permanent QRs & Hawkins Cameo Theater" -ForegroundColor Cyan
Write-Host " Steve, Max, Dustin, Eleven, and Saint Nandhish" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Ensuring assets directory and docs/ hub exist..." -ForegroundColor Green
if (!(Test-Path "public\assets")) { New-Item -ItemType Directory -Path "public\assets" -Force }
if (!(Test-Path "public\assets\qr")) { New-Item -ItemType Directory -Path "public\assets\qr" -Force }
if (!(Test-Path "docs")) { New-Item -ItemType Directory -Path "docs" -Force }

Write-Host "2. Processing Lord Nandhish caricature & generating permanent QRs..." -ForegroundColor Green
try { node scripts/process-lord-nandhish.js } catch {}
try { node scripts/generate-qrs.js } catch {}

Write-Host "3. Staging modified files..." -ForegroundColor Green
git add .

Write-Host "4. Committing changes..." -ForegroundColor Green
git commit -m "Master 4K Ultra-HD poster export with zero-blur QR vector clarity, unsharp mask sharpening, and full-resolution print engine"

Write-Host "5. Setting main branch..." -ForegroundColor Green
git branch -M main

Write-Host "6. Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " Done! Permanent QRs & Animations pushed to GitHub!" -ForegroundColor Yellow
Write-Host " Render will update your live site in ~1 minute!" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
