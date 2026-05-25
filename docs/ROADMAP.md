# ROADMAP — «Скинь мне»

## Этап 1 — Базовый Telegram-бот
**Статус:** ✅ Завершён

- [x] Monorepo + npm workspaces
- [x] Supabase migrations: users, items
- [x] Приватный доступ (ALLOWED_TELEGRAM_USER_ID)
- [x] /start + главная клавиатура
- [x] Запись, входящие, ссылки, категории, поиск
- [x] Выполнено / архив / удаление
- [x] Тесты middleware и items

**Commit:** `feat: build private telegram inbox and item manager`

---

## Этап 2 — Напоминания
**Статус:** ✅ Завершён

- [x] Таблица reminders + миграция
- [x] Меню ⏰ Напоминания, 📅 Ближайшие
- [x] Создание, snooze, отмена
- [x] Повторения (daily/weekly/monthly)
- [x] Local worker + Edge Function dispatch-reminders
- [x] Идемпотентная отправка

**Commit:** `feat: add reminders scheduling and notification workflow`

---

## Этап 3 — ИИ и голос
**Статус:** ✅ Завершён

- [x] AiIntentSchema + classifyText
- [x] Подтверждение при низкой confidence
- [x] Голосовые → транскрибация
- [x] Fallback без OPENAI_API_KEY

**Commit:** `feat: add AI classification and voice capture workflows`

---

## Этап 4 — Telegram Mini App
**Статус:** ✅ Завершён

- [x] React + Vite + Telegram theme
- [x] Edge Function telegram-auth
- [x] API Edge Function
- [x] Экраны: главная, входящие, дела, покупки, ссылки, напоминания, поиск

**Commit:** `feat: add authenticated telegram mini app dashboard`

---

## Этап 5 — Чеки и файлы
**Статус:** ✅ Завершён

- [x] attachments + private bucket
- [x] Приём фото/PDF из Telegram
- [x] Signed URLs
- [x] Поиск по документам

**Commit:** `feat: add private file archive for receipts and warranties`

---

## Этап 6 — Расходы и подписки
**Статус:** ✅ Завершён

- [x] expenses, subscriptions
- [x] Отчёты, CSV export
- [x] ИИ распознавание расходов

**Commit:** `feat: add expenses and subscription tracking`

---

## Этап 7 — «Где лежит?» и чек-листы
**Статус:** ✅ Завершён

- [x] stored_objects, checklists
- [x] Готовые шаблоны чек-листов
- [x] Глобальный поиск

**Commit:** `feat: add household locations and reusable checklists`

---

## Этап 8 — Production
**Статус:** ✅ Завершён

- [x] audit_logs
- [x] Docker, docker-compose, GitHub Actions
- [x] Backup/export, health endpoint
- [x] docs/DEPLOYMENT.md

**Commit:** `chore: harden deployment backups and production security`
