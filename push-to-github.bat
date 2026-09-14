@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Permanent QRs and Supreme Lord Nandhish Cosmic Realm
echo  9x10.9 Kodak Photo Paper Print Engine (300 DPI)
echo ======================================================
echo.

echo 1. Ensuring assets directory and docs/ exist...
if not exist "public\assets" mkdir "public\assets"
if not exist "public\assets\qr" mkdir "public\assets\qr"
if not exist "docs" mkdir "docs"
if not exist "docs\assets" mkdir "docs\assets"

echo 2. Syncing Supreme Lord Nandhish and Shaaaw Center Photo...
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789372775279.jpg" (
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789372775279.jpg" "public\assets\lord-nandhish.png" >nul
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789372775279.jpg" "public\assets\lord-nandhish-raw.jpg" >nul
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789372775279.jpg" "docs\assets\lord-nandhish.png" >nul
    echo    - Lord Nandhish caricature copied to public\assets\ and docs\assets\
)
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789381931433.jpg" (
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789381931433.jpg" "public\assets\shaaw-center.jpg" >nul
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789381931433.jpg" "docs\assets\shaaw-center.jpg" >nul
    echo    - Shaaaw center polaroid photo copied to public\assets\ and docs\assets\
)
if exist "public\assets\original-poster.jpg" (
    copy /Y "public\assets\original-poster.jpg" "docs\assets\original-poster.jpg" >nul
    echo    - Original poster copied to docs\assets\
)
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\clean_scrapbook_bg_1789392487236.jpg" (
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\clean_scrapbook_bg_1789392487236.jpg" "public\assets\original-poster.jpg" >nul
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\clean_scrapbook_bg_1789392487236.jpg" "docs\assets\original-poster.jpg" >nul
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\clean_scrapbook_bg_1789392487236.jpg" "public\assets\clean-poster-bg.jpg" >nul
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\clean_scrapbook_bg_1789392487236.jpg" "docs\assets\clean-poster-bg.jpg" >nul
    echo    - Reworked clean scrapbook background synced to public and docs assets
)

echo 3. Running 4K Ultra-HD asset sync...
node "%~dp0scripts\prepare-9x10.9-kodak.js"

echo 4. Staging modified files...
git add .

echo 5. Committing changes...
git commit -m "Add full polaroid cards, QR badges, and 3 transparent avatar figures (Buddha, Vishnu, Shepherd)"

echo 6. Setting main branch...
git branch -M main

echo 7. Pushing to GitHub...
git push -u origin main

echo.
echo ======================================================
echo  Done! 4K Shaaaw Poster, 9x10.9 Kodak Print and QRs Pushed!
echo  Render is building your live deployment now!
echo ======================================================
echo.
pause
