@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Updates to GitHub: nandhish3004
echo  Transparent Background + Smaller Saint Nandhish
echo ======================================================
echo.

echo 1. Ensuring assets directory exists...
if not exist "public\assets" mkdir "public\assets"

echo 2. Copying Saint Nandhish caricature into repository...
copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" "public\assets\caricature.png"

echo 3. Processing background transparency if node is present...
node scripts/make-transparent.js 2>nul

echo 4. Staging modified files...
git add .

echo 5. Committing changes...
git commit -m "Remove white background around caricature and make avatar smaller"

echo 6. Setting main branch...
git branch -M main

echo 7. Pushing to GitHub...
git push -u origin main

echo.
echo ======================================================
echo  Done! White background removed and avatar resized!
echo  Render is updating now - refresh in ~1 minute!
echo ======================================================
echo.
