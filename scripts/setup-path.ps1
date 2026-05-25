# Добавляет Node.js в PATH для текущего окна PowerShell
# npm.cmd вместо npm.ps1 — обход ExecutionPolicy
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
  $env:Path = "$nodePath;" + $env:Path
  Set-Alias -Name npm -Value "$nodePath\npm.cmd" -Scope Global -Force -ErrorAction SilentlyContinue
  Set-Alias -Name npx -Value "$nodePath\npx.cmd" -Scope Global -Force -ErrorAction SilentlyContinue
  Write-Host "OK: node $(& node -v), npm $(& npm.cmd -v)"
} else {
  Write-Host "Node.js не найден. Установите: winget install OpenJS.NodeJS.LTS"
  Write-Host "Затем закройте и откройте терминал заново."
}
