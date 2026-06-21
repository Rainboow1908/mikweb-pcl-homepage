@echo off
:: MikWeb PCL 主页 — 开机自启安装
:: 右键 → 以管理员身份运行

set "TARGET=%~dp0start-silent.vbs"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

:: 创建快捷方式到启动文件夹
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%STARTUP%\MikWeb-PCL.lnk'); $s.TargetPath = '%TARGET%'; $s.WorkingDirectory = '%~dp0'; $s.Save()"

echo ✅ 已添加到开机启动
echo    下次开机自动在后台运行
echo.
echo 🔗 PCL 主页地址: http://localhost:38080/pcl-homepage.xaml
pause
