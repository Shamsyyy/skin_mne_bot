import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import type { ItemType } from '@skin-mne/shared';
import { ITEM_TYPE_LABELS } from '@skin-mne/shared';
import { BTN_RECORD } from '../keyboards/main.js';
import { categoryPickerKeyboard } from '../keyboards/inline.js';
import { createItem } from '../services/items.js';
import { ensureOwnerUser } from '../services/users.js';
import { logAudit } from '../services/audit.js';

export function registerRecord(bot: Bot<BotContext>): void {
  bot.hears(BTN_RECORD, async (ctx) => {
    ctx.session.flow = 'record_text';
    await ctx.reply('Напиши, что сохранить:');
  });

  bot.callbackQuery(/^cat:(.+)$/, async (ctx) => {
    const type = ctx.match[1] as ItemType;
    const text = ctx.session.pendingText;
    if (!text) {
      await ctx.answerCallbackQuery({ text: 'Текст не найден' });
      return;
    }

    const user = await ensureOwnerUser(ctx.from!.id);
    const url = ctx.session.pendingUrl;
    await createItem(user.id, {
      type,
      content: text,
      url: url || undefined,
    });
    await logAudit(user.id, 'item.create', 'item', undefined, { type });

    ctx.session.flow = undefined;
    ctx.session.pendingText = undefined;
    ctx.session.pendingUrl = undefined;

    await ctx.editMessageText(`Сохранил в «${ITEM_TYPE_LABELS[type]}» ${ITEM_TYPE_LABELS[type].split(' ')[0]}`);
    await ctx.answerCallbackQuery();
  });
}

export async function handleRecordText(ctx: BotContext, text: string): Promise<boolean> {
  if (ctx.session.flow !== 'record_text') return false;

  ctx.session.pendingText = text;
  ctx.session.flow = 'record_category';
  await ctx.reply('Выбери категорию:', { reply_markup: categoryPickerKeyboard() });
  return true;
}
