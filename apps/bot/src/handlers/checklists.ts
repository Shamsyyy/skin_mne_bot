import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { BTN_CHECKLISTS } from '../keyboards/main.js';
import { checklistTemplatesKeyboard } from '../keyboards/inline.js';
import { createFromTemplate, formatChecklist } from '../services/checklists.js';
import { ensureOwnerUser } from '../services/users.js';

export function registerChecklists(bot: Bot<BotContext>): void {
  bot.hears(BTN_CHECKLISTS, async (ctx) => {
    await ctx.reply('Выбери готовый чек-лист:', {
      reply_markup: checklistTemplatesKeyboard(),
    });
  });

  bot.callbackQuery(/^cl:(.+)$/, async (ctx) => {
    const name = ctx.match[1];
    const user = await ensureOwnerUser(ctx.from!.id);
    const cl = await createFromTemplate(user.id, name);
    if (!cl) {
      await ctx.answerCallbackQuery({ text: 'Шаблон не найден' });
      return;
    }
    await ctx.editMessageText(formatChecklist(cl));
    await ctx.answerCallbackQuery();
  });
}
