# PROGRESS — «Скинь мне»

## Текущий статус

**Все 8 этапов реализованы** в текущей сессии.

## Проверки

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

## Что сделать вам

1. Скопировать `.env.example` → `.env` (не коммитить)
2. Создать бота в [@BotFather](https://t.me/BotFather)
3. Узнать свой `user_id` через [@userinfobot](https://t.me/userinfobot)
4. Создать проект [Supabase](https://supabase.com) и применить migrations
5. Заполнить `.env`
6. `npm run dev:bot` — локальный бот
7. `npm run dev:web` — Mini App (указать URL в BotFather)

## Следующая сессия (если нужно)

- Подключить реальный Supabase и протестировать end-to-end в Telegram
- Настроить production webhook / VPS по DEPLOYMENT.md
- Включить pg_cron для dispatch-reminders

## Исправленные проблемы

- Установлен Node.js LTS 24.16.0 (npm не был в PATH)
- Monorepo scaffold с нуля (папка была пуста, кроме tokentg.env)
