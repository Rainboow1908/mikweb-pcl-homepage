@echo off
:: 取消开机启动
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MikWeb-PCL.lnk" 2>nul
if %errorlevel% equ 0 (
    echo [OK] 已取消开机启动
) else (
    echo [INFO] 未找到开机启动项，可能已取消
)
pause
