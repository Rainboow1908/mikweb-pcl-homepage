@echo off
:: Remove from startup
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MikWeb-PCL.lnk" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Removed from startup
) else (
    echo [INFO] Not found - already removed
)
pause
