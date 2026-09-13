@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Updates to GitHub: nandhish3004
echo  Saint Nandhish personalized commentary for Shaaaw!
echo ======================================================
echo.

echo 1. Staging files...
git add .

echo 2. Committing changes...
git commit -m "Personalize Saint Nandhish dialogue addressing Shaaaw directly with witty banter"

echo 3. Setting main branch...
git branch -M main

echo 4. Linking remote if needed...
git remote remove origin 2>nul
git remote add origin https://github.com/nandhish3004/birthday-qr-memory.git

echo 5. Pushing updates to GitHub...
git push -u origin main

echo.
echo ======================================================
echo  Done! Render will automatically deploy in ~1 minute!
echo ======================================================
echo.
pause
