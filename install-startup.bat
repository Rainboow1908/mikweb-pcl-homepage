@echo off
:: 添加到开机启动（右键 → 以管理员身份运行）

set "LINK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MikWeb-PCL.lnk"
set "TARGET=%~dp0start.bat"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%LINK%'); $s.TargetPath = '%TARGET%'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 7; $s.Save()"

echo [OK] 已添加到开机启动
pause
