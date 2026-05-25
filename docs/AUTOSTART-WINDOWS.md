# Постоянная работа бота

## Вариант A: ваш ПК (Windows)

Бот работает, пока **включён компьютер**, запущен **v2rayTun** и есть интернет.

### 1. VPN при старте системы

В **v2rayTun** включите автозапуск приложения и **System proxy / HTTP-прокси** (порт 10801 или свой).

В `.env`:

```
TELEGRAM_PROXY=http://127.0.0.1:10801
```

### 2. Автозапуск бота при входе в Windows

В PowerShell из папки проекта:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-autostart.ps1
Start-ScheduledTask -TaskName SkinMneBot
```

Проверка: Планировщик заданий → задача **SkinMneBot** → «Выполнить».

Удалить автозапуск:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\remove-autostart.ps1
```

### 3. Ручной production-запуск (без watch)

```bat
scripts\run-bot-production.cmd
```

Отличие от `start-bot.cmd`: сборка + `node dist/index.js`, без перезапуска при каждом сохранении файла.

### 4. Напоминания (опционально)

Отдельный процесс (пока ПК включён):

```bat
npm run dev:worker
```

В production на VPS напоминания лучше через Supabase Edge Function + cron (см. `docs/DEPLOYMENT.md`).

---

## Вариант B: VPS 24/7 (рекомендуется)

Сервер в EU/US — **без v2rayTun и без TELEGRAM_PROXY**.

1. Аренда VPS (Hetzner, Timeweb, и т.д.)
2. `git clone` → `.env` → `npm run build -w @skin-mne/bot`
3. systemd или Docker — см. `docs/DEPLOYMENT.md`
4. `WEBHOOK_URL` вместо long polling (стабильнее на сервере)

---

## Чеклист «всё работает постоянно»

| Что | Локально (Windows) | VPS |
|-----|-------------------|-----|
| Бот отвечает в Telegram | ✅ при включённом ПК | ✅ 24/7 |
| OpenAI / ИИ | ✅ нужен v2rayTun | ✅ без VPN |
| Напоминания в чат | worker или Edge cron | Edge cron |
| Mini App | HTTPS-хостинг | Vercel / VPS |

---

## Если бот «отвалился»

1. v2rayTun включён?
2. `node scripts/test-telegram-network.mjs` → OK?
3. `scripts\stop-bot.cmd` → один раз `scripts\run-bot-production.cmd`
4. Планировщик: задача SkinMneBot — последний результат «Успешно»?
