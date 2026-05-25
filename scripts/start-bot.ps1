# Запуск бота с правильным PATH
# Если ошибка ExecutionPolicy — используйте:  scripts\start-bot.cmd
# или:  powershell -ExecutionPolicy Bypass -File .\scripts\start-bot.ps1

. "$PSScriptRoot\setup-path.ps1"
Set-Location "$PSScriptRoot\.."

Write-Host "Проверка доступа к Telegram API..."
try {
  $r = Invoke-WebRequest -Uri "https://api.telegram.org" -TimeoutSec 8 -UseBasicParsing
  Write-Host "OK: api.telegram.org доступен"
} catch {
  Write-Host "ВНИМАНИЕ: api.telegram.org недоступен. Включите VPN или TELEGRAM_PROXY в .env" -ForegroundColor Yellow
}

Write-Host "`nЗапуск npm run dev:bot (должно появиться: Bot is running @...)`n"
npm run dev:bot
