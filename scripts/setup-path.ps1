# Добавляет Node.js в PATH для текущего окна PowerShell
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
  $env:Path = "$nodePath;" + $env:Path
  Write-Host "OK: node $(node -v), npm $(npm -v)"
} else {
  Write-Host "Node.js не найден. Установите: winget install OpenJS.NodeJS.LTS"
  Write-Host "Затем закройте и откройте терминал заново."
}
