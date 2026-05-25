# Какой локальный порт слушает VPN-прокси?
$ports = 7890, 7891, 7897, 10808, 10809, 20170, 2080, 8080, 33210, 1087
Write-Host "Проверка локальных портов прокси...`n"
foreach ($p in $ports) {
  $open = (Test-NetConnection 127.0.0.1 -Port $p -WarningAction SilentlyContinue).TcpTestSucceeded
  $mark = if ($open) { "OK  " } else { "----" }
  Write-Host "$mark :$p"
}
Write-Host "`nЕсли все ---- : в VPN включите «Системный прокси» или «Mixed port / HTTP proxy»."
Write-Host "Скопируйте порт в .env → TELEGRAM_PROXY=http://127.0.0.1:ПОРТ"
