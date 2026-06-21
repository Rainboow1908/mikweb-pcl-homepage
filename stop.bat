@echo off
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] Stopped
) else (
    echo [INFO] No server running
)
pause
