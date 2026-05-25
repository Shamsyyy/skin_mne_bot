import type { NextFunction } from 'grammy';
import { getEnv } from '../config.js';
import type { BotContext } from '../types/context.js';
import { isPrivateChat } from '../utils/telegram.js';

export async function accessMiddleware(ctx: BotContext, next: NextFunction): Promise<void> {
  if (!isPrivateChat(ctx)) {
    await ctx.reply('Этот бот работает только в личном чате.');
    return;
  }

  const userId = ctx.from?.id;
  if (!userId || userId !== getEnv().ALLOWED_TELEGRAM_USER_ID) {
    await ctx.reply('Этот бот приватный');
    return;
  }

  await next();
}
