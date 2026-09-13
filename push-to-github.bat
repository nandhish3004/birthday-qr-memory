@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Updates to GitHub: nandhish3004
echo  Copying Caricature + Assets to Git Repository
echo ======================================================
echo.

echo 1. Ensuring assets directory exists...
if not exist "public\assets" mkdir "public\assets"

echo 2. Copying Saint Nandhish caricature into repository...
copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789319562845.png" "public\assets\caricature.png"

echo 3. Copying original poster into repository...
copy /y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\e6a1bd95-2328-4114-a602-d70aeb13f4f0\.user_uploaded\media_1789313085861.jpg" "public\assets\original-poster.jpg"

echo 4. Staging all files including caricature...
git add .

echo 5. Committing changes...
git commit -m "Add Saint Nandhish caricature image and assets for Render"

echo 6. Setting main branch...
git branch -M main

echo 7. Pushing to GitHub...
git push -u origin main

echo.
echo ======================================================
echo  Done! Caricature has been uploaded to GitHub!
echo  Render is rebuilding now - it will be visible in ~1 min!
echo ======================================================
echo.
