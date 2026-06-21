@echo off
:: MikWeb PCL - Add to Windows Startup (Run as Administrator)

set "TARGET=%~dp0start.ps1"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%STARTUP%\MikWeb-PCL.lnk'); $s.TargetPath = 'powershell.exe'; $s.Arguments = '-WindowStyle Hidden -File %TARGET%'; $s.WorkingDirectory = '%~dp0'; $s.Save()"

echo [OK] Added to startup. Server will auto-start on next boot.
echo.
echo PCL URL: http://localhost:38080/pcl-homepage.xaml
pause
