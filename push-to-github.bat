@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Permanent QRs, Full Polaroid Cards, Keep-sake Badges
echo  and 3 Funny Nandhish Avatars (Buddha, Vishnu, Shepherd)
echo  9x10.9 Kodak Photo Paper Print Engine (300 DPI / 4K)
echo ======================================================
echo.

echo 1. Ensuring assets directory and docs/ exist...
if not exist "public\assets" mkdir "public\assets"
if not exist "public\assets\qr" mkdir "public\assets\qr"
if not exist "docs" mkdir "docs"
if not exist "docs\assets" mkdir "docs\assets"
if not exist "docs\assets\qr" mkdir "docs\assets\qr"

echo 2. Direct Syncing all 4K Ultra-HD Assets...
set "USER_DIR=C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5"

:: Clean Reworked Background (Zero overlays, no old baked-in polaroids/QRs)
if exist "%USER_DIR%\clean_scrapbook_bg_1789392487236.jpg" (
    copy /Y "%USER_DIR%\clean_scrapbook_bg_1789392487236.jpg" "public\assets\original-poster.jpg" >nul
    copy /Y "%USER_DIR%\clean_scrapbook_bg_1789392487236.jpg" "docs\assets\original-poster.jpg" >nul
    copy /Y "%USER_DIR%\clean_scrapbook_bg_1789392487236.jpg" "public\assets\clean-poster-bg.jpg" >nul
    copy /Y "%USER_DIR%\clean_scrapbook_bg_1789392487236.jpg" "docs\assets\clean-poster-bg.jpg" >nul
    echo    - Reworked clean scrapbook background synced to public and docs assets
)

:: Shaaaw Center Polaroid Photo
if exist "%USER_DIR%\.user_uploaded\media_1789381931433.jpg" (
    copy /Y "%USER_DIR%\.user_uploaded\media_1789381931433.jpg" "public\assets\shaaw-center.jpg" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789381931433.jpg" "docs\assets\shaaw-center.jpg" >nul
    echo    - Shaaaw center polaroid photo synced
)

:: Lord Nandhish Caricature
if exist "%USER_DIR%\.user_uploaded\media_1789372775279.jpg" (
    copy /Y "%USER_DIR%\.user_uploaded\media_1789372775279.jpg" "public\assets\lord-nandhish.png" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789372775279.jpg" "public\assets\lord-nandhish-raw.jpg" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789372775279.jpg" "docs\assets\lord-nandhish.png" >nul
    echo    - Lord Nandhish caricature synced
)

:: Avatar 1: DJ Zen Buddha Nandhish (Black BG)
if exist "%USER_DIR%\.user_uploaded\media_1789393871771.jpg" (
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393871771.jpg" "public\assets\avatar-buddha.png" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393871771.jpg" "public\assets\avatar-buddha-raw.jpg" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393871771.jpg" "docs\assets\avatar-buddha.png" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393871771.jpg" "docs\assets\avatar-buddha-raw.jpg" >nul
    echo    - Buddha Nandhish avatar synced
)

:: Avatar 2: Cosmic Vishnu Nandhish (Checkerboard BG)
if exist "%USER_DIR%\.user_uploaded\media_1789393854751.jpg" (
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393854751.jpg" "public\assets\avatar-vishnu.png" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393854751.jpg" "public\assets\avatar-vishnu-raw.jpg" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393854751.jpg" "docs\assets\avatar-vishnu.png" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393854751.jpg" "docs\assets\avatar-vishnu-raw.jpg" >nul
    echo    - Vishnu Nandhish avatar synced
)

:: Avatar 3: Welcoming Shepherd Nandhish (White BG)
if exist "%USER_DIR%\.user_uploaded\media_1789393837249.png" (
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393837249.png" "public\assets\avatar-shepherd.png" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393837249.png" "public\assets\avatar-shepherd-raw.png" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393837249.png" "docs\assets\avatar-shepherd.png" >nul
    copy /Y "%USER_DIR%\.user_uploaded\media_1789393837249.png" "docs\assets\avatar-shepherd-raw.png" >nul
    echo    - Shepherd Nandhish avatar synced
)

echo 3. Synchronizing HTML Studios between docs/ and public/...
copy /Y "docs\kodak-print.html" "public\kodak-print.html" >nul
copy /Y "docs\new-poster.html" "public\new-poster.html" >nul
echo    - kodak-print.html and new-poster.html synced!

echo 4. Running Node asset helper...
node "%~dp0scripts\prepare-9x10.9-kodak.js"

echo 5. Staging modified files...
git add -A

echo 6. Committing changes...
git commit -m "Fix: Remove unwanted badges and captions, eliminate starburst spikes, transparent avatars, and scannable QRs"

echo 7. Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ======================================================
echo  Done! Full Polaroid Cards, QRs, and Avatars Pushed!
echo  Visit: https://nandhish3004.github.io/birthday-qr-memory/new-poster.html
echo  Visit: https://nandhish3004.github.io/birthday-qr-memory/kodak-print.html
echo ======================================================
echo.
pause
