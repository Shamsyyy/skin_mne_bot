import type { NextFunction } from 'grammy';
import type { BotContext } from '../types/context.js';
import { logger } from '../utils/logger.js';
import { safeReply } from '../utils/reply.js';

export async function errorHandler(ctx: BotContext, next: NextFunction): Promise<void> {
  try {
    await next();
  } catch (err) {
    logger.error('Handler error', err);
    await safeReply(ctx, 'Не получилось выполнить действие. Попробуй ещё раз.').catch(() => {});
  }
}
