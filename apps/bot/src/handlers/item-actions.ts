import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { updateItemStatus } from '../services/items.js';
import { ensureOwnerUser } from '../services/users.js';
import { logAudit } from '../services/audit.js';

export function registerItemActions(bot: Bot<BotContext>): void {
  bot.callbackQuery(/^item:done:(.+)$/, async (ctx) => {
    const user = await ensureOwnerUser(ctx.from!.id);
    await updateItemStatus(user.id, ctx.match[1], 'done');
    await logAudit(user.id, 'item.done', 'item', ctx.match[1]);
    await ctx.editMessageText('Готово. Отметил как выполненное ✅');
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^item:archive:(.+)$/, async (ctx) => {
    const user = await ensureOwnerUser(ctx.from!.id);
    await updateItemStatus(user.id, ctx.match[1], 'archived');
    await logAudit(user.id, 'item.archive', 'item', ctx.match[1]);
    await ctx.editMessageText('Убрал в архив 📦');
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^item:delete:(.+)$/, async (ctx) => {
    const user = await ensureOwnerUser(ctx.from!.id);
    await updateItemStatus(user.id, ctx.match[1], 'deleted');
    await logAudit(user.id, 'item.delete', 'item', ctx.match[1]);
    await ctx.editMessageText('Удалил 🗑');
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^item:remind:(.+)$/, async (ctx) => {
    ctx.session.pendingItemId = ctx.match[1];
    ctx.session.flow = 'reminder_text';
    await ctx.answerCallbackQuery();
    await ctx.reply('О чём напомнить? (можно оставить как в записи — напиши «да»)');
  });
}
