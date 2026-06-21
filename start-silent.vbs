' MikWeb PCL 主页 — 静默启动脚本
' 双击运行，或放到开机启动项中
CreateObject("WScript.Shell").Run "node server.js", 0, False
