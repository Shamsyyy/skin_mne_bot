import { InlineKeyboard } from 'grammy';
import type { ItemType } from '@skin-mne/shared';
import { ITEM_TYPE_LABELS } from '@skin-mne/shared';
import { ATTACHMENT_LABELS, type AttachmentCategory } from '@skin-mne/shared';

export function categoryPickerKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  const types: ItemType[] = ['task', 'purchase', 'link', 'note', 'inbox'];
  for (const t of types) {
    kb.text(ITEM_TYPE_LABELS[t], `cat:${t}`).row();
  }
  return kb;
}

export function itemActionsKeyboard(itemId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('✅ Выполнено', `item:done:${itemId}`)
    .text('📦 Архивировать', `item:archive:${itemId}`)
    .row()
    .text('⏰ Напомнить', `item:remind:${itemId}`)
    .text('🗑 Удалить', `item:delete:${itemId}`);
}

export function inboxMoveKeyboard(itemId: string): InlineKeyboard {
  const kb = new InlineKeyboard();
  const types: ItemType[] = ['task', 'purchase', 'link', 'note'];
  for (const t of types) {
    kb.text(ITEM_TYPE_LABELS[t], `inbox:${t}:${itemId}`).row();
  }
  return kb;
}

export function reminderTimeKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Сегодня вечером', 'rem:today_evening')
    .row()
    .text('Завтра утром', 'rem:tomorrow_morning')
    .row()
    .text('Завтра вечером', 'rem:tomorrow_evening')
    .row()
    .text('Без повторения', 'rem:none')
    .row()
    .text('Каждый день', 'rem:daily')
    .text('Каждую неделю', 'rem:weekly')
    .row()
    .text('Каждый месяц', 'rem:monthly');
}

export function reminderSentKeyboard(reminderId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('✅ Выполнено', `rsent:done:${reminderId}`)
    .row()
    .text('⏰ Через 1 час', `rsent:1h:${reminderId}`)
    .text('🌅 Завтра утром', `rsent:tm:${reminderId}`)
    .row()
    .text('❌ Отменить', `rsent:cancel:${reminderId}`);
}

export function aiConfirmKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('✅ Сохранить', 'ai:save')
    .text('✏️ Изменить', 'ai:edit')
    .row()
    .text('❌ Отмена', 'ai:cancel');
}

export function attachmentCategoryKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  const cats = Object.keys(ATTACHMENT_LABELS) as AttachmentCategory[];
  for (const c of cats) {
    kb.text(ATTACHMENT_LABELS[c], `att:${c}`).row();
  }
  return kb;
}

export function checklistTemplatesKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  const templates = [
    'В поездку',
    'На шашлык',
    'В аэропорт',
    'В спортзал',
    'На дачу',
  ];
  for (const t of templates) {
    kb.text(t, `cl:${t}`).row();
  }
  return kb;
}
