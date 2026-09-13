Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Pushing Updates to GitHub: nandhish3004" -ForegroundColor Cyan
Write-Host " Copying Caricature + Assets to Git Repository" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Copying Saint Nandhish caricature into repository..." -ForegroundColor Green
if (!(Test-Path "public\assets")) { New-Item -ItemType Directory -Path "public\assets" -Force }
Copy-Item "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" "public\assets\caricature.png" -Force
Copy-Item "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789313085861.jpg" "public\assets\original-poster.jpg" -Force

Write-Host "2. Staging all files..." -ForegroundColor Green
git add .

Write-Host "3. Committing changes..." -ForegroundColor Green
git commit -m "Add Saint Nandhish caricature image and assets for Render"

Write-Host "4. Setting main branch..." -ForegroundColor Green
git branch -M main

Write-Host "5. Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " Done! Caricature uploaded to GitHub!" -ForegroundColor Yellow
Write-Host " Render is rebuilding now and will show the caricature!" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
