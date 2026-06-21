' MikWeb PCL 主页 — 静默启动脚本
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
Set ws = CreateObject("WScript.Shell")
ws.CurrentDirectory = dir
ws.Run "start.bat", 0, False
