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
set "elapsed=0"
start /b cmd /c "git pull >nul 2>&1 && echo 1>%flag%"
set "spin=\|/-"
set "i=0"

:spin
set /a "i+=1"
set /a "idx=i %% 4"
call set "c=%%spin:~!idx!,1%%"
set /p "=Updating... !c! "<nul
choice /t 1 /d y /c y >nul 2>&1
set /a "elapsed+=1"
if exist "%flag%" (
    if !elapsed! geq 1 goto done
    goto spin
)
goto spin

:done
del "%flag%" 2>nul
echo Done.

:skip
start /min "" node server.js
