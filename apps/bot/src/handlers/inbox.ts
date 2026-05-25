import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import type { ItemType } from '@skin-mne/shared';
import { ITEM_TYPE_LABELS } from '@skin-mne/shared';
import { BTN_INBOX } from '../keyboards/main.js';
import { inboxMoveKeyboard } from '../keyboards/inline.js';
import { createItem, listItems } from '../services/items.js';
import { moveInboxToType } from '../services/items.js';
import { ensureOwnerUser } from '../services/users.js';
import { formatItemLine } from '../utils/format.js';

export async function saveToInbox(ctx: BotContext, text: string, url?: string): Promise<void> {
  const user = await ensureOwnerUser(ctx.from!.id);
  const item = await createItem(user.id, {
    type: 'inbox',
    content: text,
    url,
  });

  await ctx.reply('Сохранил во Входящие. Разобрать сейчас?', {
    reply_markup: inboxMoveKeyboard(item.id),
  });
}

export function registerInbox(bot: Bot<BotContext>): void {
  bot.hears(BTN_INBOX, async (ctx) => {
    const user = await ensureOwnerUser(ctx.from!.id);
    const items = await listItems(user.id, 'inbox');
    if (items.length === 0) {
      await ctx.reply('Входящие пусты 📥');
      return;
    }
    for (const item of items) {
      await ctx.reply(formatItemLine(item.content, item.type, item.created_at, user.timezone), {
        reply_markup: inboxMoveKeyboard(item.id),
      });
    }
  });

  bot.callbackQuery(/^inbox:(.+):(.+)$/, async (ctx) => {
    const type = ctx.match[1] as ItemType;
    const itemId = ctx.match[2];
    const user = await ensureOwnerUser(ctx.from!.id);
    await moveInboxToType(user.id, itemId, type);
    await ctx.editMessageText(`Перенёс в «${ITEM_TYPE_LABELS[type]}» ✅`);
    await ctx.answerCallbackQuery();
  });
}
