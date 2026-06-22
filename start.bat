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

:: Animated spinner in one line
powershell -c "$s=@('\','|','/','-');$n=0;while(!(test-path $env:temp'\mikweb-update-flag') -or $n -lt 3){write-host -noNewline \"`rUpdating... $($s[$n++ % 4]) \";sleep -m 300};write-host \"`rUpdating... done.   `nDone.\""

:skip
start /min "" node server.js
