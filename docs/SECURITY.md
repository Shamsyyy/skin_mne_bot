# Безопасность — «Скинь мне»

## Модель доступа

- Бот **приватный**: только `ALLOWED_TELEGRAM_USER_ID`
- Групповые чаты **запрещены**
- При несовпадении user_id: «Этот бот приватный»

## Секреты

| Переменная | Где использовать |
|------------|------------------|
| `BOT_TOKEN` | bot, Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | bot, Edge Functions only |
| `OPENAI_API_KEY` | bot server only |
| `SESSION_SECRET` | Edge Functions (Mini App sessions) |

**Никогда:** в frontend, в git, в логах.

## Telegram Mini App

1. Клиент передаёт `initData` (не `initDataUnsafe`)
2. Сервер проверяет HMAC-SHA256 подпись Bot Token
3. Проверка `auth_date` (не старше 24 часов)
4. Проверка `ALLOWED_TELEGRAM_USER_ID`
5. Выдача короткой сессии (JWT/session token)

## Supabase RLS

Все таблицы с `ENABLE ROW LEVEL SECURITY`. Bot использует service role с фильтрацией по `user_id` в коде.

## Файлы

- Bucket `user-files`: **private**
- Путь: `{user_id}/{attachment_id}/{filename}`
- Доступ: signed URL, TTL 60 секунд
- Не использовать публичные URL

## Запрещённые данные

**Не хранить** в боте:

- Пароли от аккаунтов
- Данные банковских карт
- Паспорт, СНИЛС
- Коды восстановления
- Секретные API-ключи

Для критичных документов — отдельный зашифрованный vault (будущая архитектура).

## Audit log (этап 8)

Логируем: create/update/delete/archive, выдачу файла, вход Mini App.

**Не логируем:** секреты, полный текст заметок, голосовые.

## AI (этап 3)

- API key только на сервере
- ИИ не удаляет записи без подтверждения
- Без ключа — ручной режим работает
- Не отправлять в OpenAI файлы без явного OCR-запроса
