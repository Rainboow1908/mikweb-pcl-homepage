@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

git fetch 2>nul
git status -uno 2>nul | find "Your branch is behind" >nul
if %errorlevel% equ 0 (
    echo An update is available.
    choice /c yn /m "Apply update now?"
    if errorlevel 2 goto skip
    if errorlevel 1 (
        set "bar="
        for /l %%i in (1,1,5) do (
            set "bar=!bar!#####"
            set /p "=Updating [!bar!] "<nul
            choice /t 1 /d y /c y >nul
        )
        echo.
        git pull
    )
)
:skip
start /min "" node server.js
