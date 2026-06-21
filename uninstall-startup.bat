@echo off
:: MikWeb PCL - Remove from Windows Startup
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MikWeb-PCL.lnk" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Removed from startup.
) else (
    echo [INFO] Startup entry not found - nothing to remove.
)
pause
