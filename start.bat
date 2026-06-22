@echo off
cd /d "%~dp0"
git pull 2>nul
start /min "" node server.js
