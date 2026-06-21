$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { $node = "$env:ProgramFiles\nodejs\node.exe" }
Start-Process -WindowStyle Hidden -FilePath $node -ArgumentList server.js -WorkingDirectory $PSScriptRoot
