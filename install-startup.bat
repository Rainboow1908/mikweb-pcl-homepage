@echo off
:: MikWeb PCL - Add to Windows Startup (Run as Administrator)
powershell -ExecutionPolicy Bypass -File "%~dp0install-startup.ps1"
pause
