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

set "flag=%temp%\mikweb-update-flag"
start /b cmd /c "git pull >nul 2>&1 && echo 1>%flag%"
set "spin=\|/-"
set "i=0"
set "elapsed=0"
set /a "minframes=%random% %% 6 + 3"

:spin
set /a "i+=1"
set /a "idx=i %% 4"
call set "c=%%spin:~!idx!,1%%"
cls
echo Updating... !c!
ping -n 1 -w 300 192.0.2.1 >nul
set /a "elapsed+=1"
if exist "%flag%" (
    if !elapsed! geq !minframes! goto done
    goto spin
)
goto spin

:done
del "%flag%" 2>nul
cls
echo Updating... done.
echo.
echo Done.

:skip
start /min "" node server.js
