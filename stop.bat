@echo off
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] 已停止
) else (
    echo [INFO] 没有正在运行的服务器
)
pause
