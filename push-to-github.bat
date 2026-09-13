@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Permanent QRs & Hawkins Cameo Theater
echo  Featuring Steve, Max, Dustin, Eleven, and Saint Nandhish
echo ======================================================
echo.

echo 1. Ensuring caricature asset is in place...
if not exist "public\assets" mkdir "public\assets"
if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" (
    copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" "public\assets\caricature.png"
)

echo 2. Running transparency filter...
node scripts\make-transparent.js 2>nul

echo 3. Staging modified files...
git add .

echo 4. Committing changes...
git commit -m "Fix dialogue box overlap on characters in Cameo Theater, unobstructed stage view, remove disturbing floating buttons"

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
