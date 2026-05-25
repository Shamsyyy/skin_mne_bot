import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import type { ItemType } from '@skin-mne/shared';
import { BTN_TASKS, BTN_PURCHASES, BTN_LINKS, BTN_NOTES } from '../keyboards/main.js';
import { listItems } from '../services/items.js';
import { ensureOwnerUser } from '../services/users.js';
import { formatItemLine } from '../utils/format.js';
import { itemActionsKeyboard } from '../keyboards/inline.js';

const CATEGORY_MAP: Record<string, ItemType> = {
  [BTN_TASKS]: 'task',
  [BTN_PURCHASES]: 'purchase',
  [BTN_LINKS]: 'link',
  [BTN_NOTES]: 'note',
};

export function registerCategories(bot: Bot<BotContext>): void {
  for (const [btn, type] of Object.entries(CATEGORY_MAP)) {
    bot.hears(btn, async (ctx) => {
      const user = await ensureOwnerUser(ctx.from!.id);
      const items = await listItems(user.id, type);
      if (items.length === 0) {
        await ctx.reply('Пока пусто.');
        return;
      }
      for (const item of items) {
        const text =
          type === 'link' && item.url
            ? `${formatItemLine(item.content, item.type, item.created_at, user.timezone)}\n🔗 ${item.url}`
            : formatItemLine(item.content, item.type, item.created_at, user.timezone);
        await ctx.reply(text, { reply_markup: itemActionsKeyboard(item.id) });
      }
    });
  }
}
