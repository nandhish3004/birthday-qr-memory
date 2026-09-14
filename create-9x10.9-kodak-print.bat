@echo off
cd /d "%~dp0"
title 9x10.9 Kodak Photo Paper Print Engine (300 DPI)
echo ==============================================================================
echo   Shaaaw's Scrapbook Poster - 9x10.9 Inch Kodak Photo Paper Formatter
echo   Resolution: 2700 x 3270 @ 300 DPI (Photo-Lab Archival Standard)
echo ==============================================================================
echo.

if exist "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789372775279.jpg" (
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789372775279.jpg" "public\assets\lord-nandhish.png" >nul
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789372775279.jpg" "public\assets\lord-nandhish-raw.jpg" >nul
    copy /Y "C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\.user_uploaded\media_1789372775279.jpg" "docs\assets\lord-nandhish.png" >nul
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\prepare-kodak-and-assets.ps1" -TargetDir "%~dp0"

echo.
echo ==============================================================================
echo Files Generated:
echo  1. Shaaaw-Scrapbook-Poster-9x10.9-Kodak-300DPI.jpg  (Best for Kodak Kiosks/Labs)
echo  2. Shaaaw-Scrapbook-Poster-9x10.9-Kodak-300DPI.png  (Lossless Archival)
echo  3. public\assets\lord-nandhish.png                  (Celestial Deity Avatar)
echo ==============================================================================
echo.
pause
