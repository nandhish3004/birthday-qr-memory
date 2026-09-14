@echo off
cd /d "%~dp0"
title 8x10 Kodak Photo Paper Print Engine (300 DPI)
echo ==============================================================================
echo   Shaaaw's Scrapbook Poster - 8x10 Inch Kodak Photo Paper Formatter
echo   Resolution: 2400 x 3000 @ 300 DPI (International Photo Print Standard)
echo ==============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\prepare-kodak-and-assets.ps1"

echo.
echo ==============================================================================
echo Files Generated:
echo  1. Shaaaw-Scrapbook-Poster-8x10-Kodak-300DPI.jpg  (Best for Kodak Kiosks/Labs)
echo  2. Shaaaw-Scrapbook-Poster-8x10-Kodak-300DPI.png  (Lossless Archival)
echo  3. public\assets\lord-nandhish.png                (Celestial Deity Avatar)
echo ==============================================================================
echo.
pause
