import { Keyboard } from 'grammy';

export const MAIN_KEYBOARD = new Keyboard()
  .text('➕ Записать')
  .text('📥 Входящие')
  .row()
  .text('✅ Дела')
  .text('🛒 Покупки')
  .row()
  .text('🔗 Ссылки')
  .text('📝 Заметки')
  .row()
  .text('🔍 Найти')
  .text('⏰ Напоминания')
  .row()
  .text('📅 Ближайшие')
  .text('💸 Расходы')
  .row()
  .text('📍 Где лежит')
  .text('📋 Чек-листы')
  .row()
  .text('📱 Открыть приложение')
  .resized()
  .persistent();

export const BTN_RECORD = '➕ Записать';
export const BTN_INBOX = '📥 Входящие';
export const BTN_TASKS = '✅ Дела';
export const BTN_PURCHASES = '🛒 Покупки';
export const BTN_LINKS = '🔗 Ссылки';
export const BTN_NOTES = '📝 Заметки';
export const BTN_SEARCH = '🔍 Найти';
export const BTN_REMINDERS = '⏰ Напоминания';
export const BTN_UPCOMING = '📅 Ближайшие';
export const BTN_EXPENSES = '💸 Расходы';
export const BTN_LOCATIONS = '📍 Где лежит';
export const BTN_CHECKLISTS = '📋 Чек-листы';
export const BTN_MINI_APP = '📱 Открыть приложение';
