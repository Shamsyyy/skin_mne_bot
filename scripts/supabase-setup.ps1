# Настройка Supabase CLI (после setup-path.ps1)
. "$PSScriptRoot\setup-path.ps1"

Set-Location "$PSScriptRoot\.."

$projectRef = "egdkpbvdgvohvixobvwt"

Write-Host "`n1) Войдите в Supabase (откроется браузер или вставьте token):"
Write-Host "   supabase login`n"
supabase login

Write-Host "`n2) Привязка проекта..."
supabase link --project-ref $projectRef

Write-Host "`n3) Применение миграций..."
supabase db push

Write-Host "`nГотово. Проверьте таблицы в Dashboard -> Table Editor."
