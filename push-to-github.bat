@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Authentic Scrapbook Poster & QR Memory System
echo  - Embedded Polaroid Apertures (No Glued Cards)
echo  - Embedded Warm Paper QR Codes (No White Badges)
echo  - Transparent Storytelling Avatars (Buddha, Vishnu, Shepherd)
echo  - 9x10.9 Kodak Photo Print Studio (300 DPI / 4K)
echo ======================================================
echo.

echo 1. Ensuring assets directories exist...
if not exist "public\assets" mkdir "public\assets"
if not exist "public\assets\qr" mkdir "public\assets\qr"
if not exist "docs" mkdir "docs"
if not exist "docs\assets" mkdir "docs\assets"
if not exist "docs\assets\qr" mkdir "docs\assets\qr"

echo 2. Copying user-embedded scrapbook poster (media_1789417290826.jpg)...
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\6ea84756-37a6-43a8-8392-c3735cd7d754\.user_uploaded\media_1789417290826.jpg" (
  copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\6ea84756-37a6-43a8-8392-c3735cd7d754\.user_uploaded\media_1789417290826.jpg" "public\assets\original-poster.jpg" >nul
  copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\6ea84756-37a6-43a8-8392-c3735cd7d754\.user_uploaded\media_1789417290826.jpg" "docs\assets\original-poster.jpg" >nul
  copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\6ea84756-37a6-43a8-8392-c3735cd7d754\.user_uploaded\media_1789417290826.jpg" "public\assets\clean-poster-bg.jpg" >nul
  copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\6ea84756-37a6-43a8-8392-c3735cd7d754\.user_uploaded\media_1789417290826.jpg" "docs\assets\clean-poster-bg.jpg" >nul
  echo    - New composite poster copied to assets!
)

echo 3. Synchronizing HTML Studios between docs/ and public/...
copy /Y "docs\kodak-print.html" "public\kodak-print.html" >nul
copy /Y "docs\new-poster.html" "public\new-poster.html" >nul
echo    - kodak-print.html and new-poster.html synced!

echo 3. Staging modified files...
git add -A

echo 4. Committing changes...
git commit -m "feat: Ultra-sharp 4K studio Polaroid frames covering old frames with perfect photo fit, pink washi tape & handwritten caption"

echo 5. Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ======================================================
echo  Done! Authentic Scrapbook & Memories Pushed to GitHub!
echo  Visit: https://nandhish3004.github.io/birthday-qr-memory/kodak-print.html
echo ======================================================
echo.
pause
