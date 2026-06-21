' MikWeb PCL 主页 — 静默启动脚本
Set ws = CreateObject("WScript.Shell")
ws.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
ws.Run "node server.js", 0, False
