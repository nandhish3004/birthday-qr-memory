@echo off
cd /d "%~dp0"
echo ======================================================
echo  Generating Transparent Polaroid Frame Overlay
echo  (Punches transparent windows in the 7 Polaroid frames)
echo ======================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\create-transparent-overlay.ps1" -TargetDir "%~dp0"
echo.
pause
