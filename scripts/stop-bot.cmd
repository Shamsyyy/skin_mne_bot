@echo off
echo Stopping bot Node processes for skin-mne...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-CimInstance Win32_Process -Filter \"name='node.exe'\" | Where-Object { $_.CommandLine -match 'skin mne' -or $_.CommandLine -match 'skin-mne' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul
echo Done. Now run only ONE: scripts\start-bot.cmd
