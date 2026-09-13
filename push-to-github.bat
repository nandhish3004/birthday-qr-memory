@echo off
cd /d "%~dp0"
echo ======================================================
echo  Pushing Birthday QR Memory System to GitHub
echo  GitHub Account: nandhish3004
echo ======================================================
echo.

echo 1. Initializing Git repository...
git init

echo 2. Staging project files...
git add .

echo 3. Creating commit...
git commit -m "Complete Birthday QR-Code Memory System for Shaaaw"

echo 4. Setting branch to main...
git branch -M main

echo 5. Linking remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/nandhish3004/birthday-qr-memory.git

echo 6. Pushing to GitHub...
echo (If prompted, log in with your GitHub credentials or browser)
git push -u origin main

echo.
echo ======================================================
echo  Done! If you haven't created the repository yet,
echo  create a new repo named 'birthday-qr-memory' at:
echo  https://github.com/new
echo ======================================================
echo.
pause
