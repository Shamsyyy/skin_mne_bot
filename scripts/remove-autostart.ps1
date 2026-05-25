# Удаляет автозапуск бота.
Unregister-ScheduledTask -TaskName 'SkinMneBot' -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "Автозапуск SkinMneBot удалён (если был)."
