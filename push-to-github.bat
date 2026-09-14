@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Permanent QRs & Hawkins Cameo Theater
echo  Featuring Steve, Max, Dustin, Eleven, and Saint Nandhish
echo ======================================================
echo.

echo 1. Ensuring assets are in place...
if not exist "public\assets" mkdir "public\assets"
if not exist "public\assets\qr" mkdir "public\assets\qr"
if not exist "docs" mkdir "docs"

echo 2. Processing Lord Nandhish caricature & generating 8x10 Kodak prints...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\prepare-kodak-and-assets.ps1"
node scripts\generate-qrs.js 2>nul

echo 3. Staging modified files...
git add .

echo 4. Committing changes...
git commit -m "Master 4K Ultra-HD poster export with zero-blur QR vector clarity, unsharp mask sharpening, and full-resolution print engine"

echo 5. Setting main branch...
git branch -M main

echo 6. Pushing to GitHub...
git push -u origin main

echo.
echo ======================================================
echo  Done! Permanent QRs & Animations pushed to GitHub!
echo  Render is building your live deployment now!
echo ======================================================
echo.
pause
