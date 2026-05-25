# Регистрирует автозапуск бота при входе в Windows.
# Запуск: powershell -ExecutionPolicy Bypass -File scripts\install-autostart.ps1

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$runScript = Join-Path $root 'scripts\run-bot-production.cmd'
$taskName = 'SkinMneBot'

if (-not (Test-Path $runScript)) {
  Write-Error "Not found: $runScript"
}

$action = New-ScheduledTaskAction `
  -Execute 'cmd.exe' `
  -Argument "/c `"$runScript`"" `
  -WorkingDirectory $root

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -RestartCount 5 `
  -RestartInterval (New-TimeSpan -Minutes 2) `
  -ExecutionTimeLimit (New-TimeSpan -Days 365)

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description 'Telegram bot Skin Mne (production)' `
  -Force | Out-Null

Write-Host "OK: задача '$taskName' создана."
Write-Host "Бот стартует при входе в Windows."
Write-Host ""
Write-Host "Важно:"
Write-Host "  1) v2rayTun — автозапуск в настройках приложения"
Write-Host "  2) TELEGRAM_PROXY в .env (например http://127.0.0.1:10801)"
Write-Host ""
Write-Host "Сейчас запустить:  Start-ScheduledTask -TaskName '$taskName'"
Write-Host "Удалить автозапуск: powershell -File scripts\remove-autostart.ps1"
