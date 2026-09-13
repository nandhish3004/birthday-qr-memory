Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Pushing Permanent QRs & Hawkins Cameo Theater" -ForegroundColor Cyan
Write-Host " Steve, Max, Dustin, Eleven, and Saint Nandhish" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Copying Saint Nandhish caricature into repository..." -ForegroundColor Green
if (!(Test-Path "public\assets")) { New-Item -ItemType Directory -Path "public\assets" -Force }
if (Test-Path "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png") {
    Copy-Item "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" "public\assets\caricature.png" -Force
}

Write-Host "2. Processing background transparency..." -ForegroundColor Green
try { node scripts/make-transparent.js } catch {}

Write-Host "3. Staging modified files..." -ForegroundColor Green
git add .

Write-Host "4. Committing changes..." -ForegroundColor Green
git commit -m "Permanent permalink QRs (never change on media upload/replace), persistent domain config, 30s character animations (Steve, Max, Dustin, Eleven) conversing with Saint Nandhish caricature, The Hawkins Archive"

Write-Host "5. Setting main branch..." -ForegroundColor Green
git branch -M main

Write-Host "6. Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " Done! Permanent QRs & Animations pushed to GitHub!" -ForegroundColor Yellow
Write-Host " Render will update your live site in ~1 minute!" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
