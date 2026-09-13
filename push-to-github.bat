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

if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" (
    copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" "public\assets\caricature.png"
)
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324183044.jpg" (
    copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324183044.jpg" "public\assets\original-poster.jpg"
)
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207212.png" (
    copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207212.png" "public\assets\qr\1.png"
)
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207225.png" (
    copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207225.png" "public\assets\qr\2.png"
)
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207257.png" (
    copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789324207257.png" "public\assets\qr\3.png"
)

echo 2. Processing assets & generating composite poster with real QRs...
node scripts\make-transparent.js 2>nul
node scripts\generate-qrs.js 2>nul

echo 3. Staging modified files...
git add .

echo 4. Committing changes...
git commit -m "Direct instant memory playback when scanning QR (no distracting theater on tape page), updated scrapbook poster, first 3 QRs integrated"

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
