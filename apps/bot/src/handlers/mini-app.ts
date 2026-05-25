import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { BTN_MINI_APP } from '../keyboards/main.js';
import { getEnv } from '../config.js';

export function registerMiniApp(bot: Bot<BotContext>): void {
  bot.hears(BTN_MINI_APP, async (ctx) => {
    const url = getEnv().TELEGRAM_MINI_APP_URL;
    if (!url) {
      await ctx.reply('Mini App URL не настроен. Укажи TELEGRAM_MINI_APP_URL в .env');
      return;
    }
    await ctx.reply('Открыть приложение:', {
      reply_markup: {
        inline_keyboard: [[{ text: '📱 Открыть', web_app: { url } }]],
      },
    });
  });
}
