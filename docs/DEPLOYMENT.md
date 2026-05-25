# Развёртывание — «Скинь мне»

## Требования

- Node.js 22+ LTS
- Supabase project
- Telegram Bot Token

## Переменные окружения (production)

См. `.env.example`. Все секреты — в настройках хостинга / Supabase Secrets.

## Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Примените миграции:

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

3. Задеплойте Edge Functions:

```bash
npx supabase functions deploy dispatch-reminders
npx supabase functions deploy telegram-auth
npx supabase functions deploy api
```

4. Secrets для functions: `BOT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_TELEGRAM_USER_ID`, `SESSION_SECRET`

5. Cron (Dashboard → Database → Extensions → pg_cron):

```sql
SELECT cron.schedule(
  'dispatch-reminders',
  '* * * * *',
  $$ SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/dispatch-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) $$
);
```

## Бот (VPS / Render / Railway)

### Docker

```bash
docker build -f apps/bot/Dockerfile -t skin-mne-bot .
docker run --env-file .env skin-mne-bot
```

### Long polling (локально / простой VPS)

```bash
npm run dev:bot
# или production:
NODE_ENV=production npm run start -w @skin-mne/bot
```

### Webhook (production)

Установите `WEBHOOK_URL=https://your-domain.com/webhook` и `PORT=3000`.

## Mini App

1. Соберите: `npm run build -w @skin-mne/web`
2. Разместите `apps/web/dist` на HTTPS (Vercel, Netlify, или тот же VPS)
3. В BotFather: Menu Button → URL вашего Mini App
4. `TELEGRAM_MINI_APP_URL` в `.env`

## GitHub Actions

CI запускает lint, typecheck, test, build на каждый push.

## Backup

- JSON export: команда бота / Edge API `GET /export`
- CSV расходов: `GET /export/expenses.csv`
- Supabase Dashboard → Database → Backups (Pro plan)

## Health check

`GET /health` на порту бота (webhook mode) возвращает `{ "ok": true }`.
