import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { MAIN_KEYBOARD } from '../keyboards/main.js';
import { ensureOwnerUser } from '../services/users.js';

export function registerStart(bot: Bot<BotContext>): void {
  bot.command('start', async (ctx) => {
    try {
      await ensureOwnerUser(ctx.from!.id, ctx.from!.first_name, ctx.from!.username);
    } catch {
      await ctx.reply(
        'Бот запущен, но база не готова.\nПримените миграции: supabase/apply-all-migrations.sql в SQL Editor.',
      );
      return;
    }
    await ctx.reply(
      'Привет! Я твой личный помощник «Скинь мне».\nОтправляй дела, покупки, ссылки и заметки — я сохраню их и помогу быстро найти.',
      { reply_markup: MAIN_KEYBOARD },
    );
  });
}
