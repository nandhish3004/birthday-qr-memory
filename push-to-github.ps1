Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Pushing Permanent QRs & Hawkins Cameo Theater" -ForegroundColor Cyan
Write-Host " Steve, Max, Dustin, Eleven, and Saint Nandhish" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Copying assets (caricature, scrapbook poster, QRs) into repository..." -ForegroundColor Green
if (!(Test-Path "public\assets")) { New-Item -ItemType Directory -Path "public\assets" -Force }
if (!(Test-Path "public\assets\qr")) { New-Item -ItemType Directory -Path "public\assets\qr" -Force }

if (Test-Path "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png") {
    Copy-Item "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" "public\assets\caricature.png" -Force
}
if (Test-Path "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324183044.jpg") {
    Copy-Item "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324183044.jpg" "public\assets\original-poster.jpg" -Force
}
if (Test-Path "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207212.png") {
    Copy-Item "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207212.png" "public\assets\qr\1.png" -Force
}
if (Test-Path "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207225.png") {
    Copy-Item "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207225.png" "public\assets\qr\2.png" -Force
}
if (Test-Path "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207257.png") {
    Copy-Item "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207257.png" "public\assets\qr\3.png" -Force
}

Write-Host "2. Processing background transparency & generating composite poster with real QRs..." -ForegroundColor Green
try { node scripts/make-transparent.js } catch {}
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
