$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$startup = [Environment]::GetFolderPath('Startup')
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("$startup\MikWeb-PCL.lnk")
$s.TargetPath = 'powershell.exe'
$s.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$dir\start.ps1`""
$s.WorkingDirectory = $dir
$s.Save()
Write-Host "[OK] Added to startup. PCL: http://localhost:38080/pcl-homepage.xaml"
