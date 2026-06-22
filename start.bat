@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

git fetch 2>nul
git status -uno 2>nul | find "Your branch is behind" >nul
if %errorlevel% neq 0 (
    start /min "" node server.js
    exit /b
)

echo An update is available.
choice /c yn /m "Apply update now?"
if errorlevel 2 goto skip

:: Start update in background
set "flag=%temp%\mikweb-update-flag"
start /b cmd /c "git pull >nul 2>&1 && echo 1>%flag%"
set "bar="
set "steps=0"

:loop
set /a "steps+=1"
set "bar=!bar!#"
set /p "=Updating [!bar!] "<nul
choice /t 1 /d y /c y >nul 2>&1
if exist "%flag%" goto done
if %steps% lss 20 goto loop

:done
:: Pad to at least 1 second total
if %steps% lss 1 (
    choice /t 1 /d y /c y >nul 2>&1
)
del "%flag%" 2>nul
echo.

:skip
start /min "" node server.js
