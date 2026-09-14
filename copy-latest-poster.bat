@echo off
cd /d "%~dp0"
echo ======================================================
echo  Copying Shaaaw's Final Scrapbook Composite Poster
echo ======================================================

set "SRC=C:\Users\Nandheesaprasad\.gemini\antigravity-ide\brain\6ea84756-37a6-43a8-8392-c3735cd7d754\.user_uploaded\media_1789417290826.jpg"

if exist "%SRC%" (
    if not exist "public\assets" mkdir "public\assets"
    if not exist "docs\assets" mkdir "docs\assets"
    copy /Y "%SRC%" "public\assets\original-poster.jpg" >nul
    copy /Y "%SRC%" "docs\assets\original-poster.jpg" >nul
    copy /Y "%SRC%" "public\assets\clean-poster-bg.jpg" >nul
    copy /Y "%SRC%" "docs\assets\clean-poster-bg.jpg" >nul
    echo [SUCCESS] Copied to public\assets and docs\assets!
) else (
    echo [WARNING] Source file not found: %SRC%
)

echo.
pause
