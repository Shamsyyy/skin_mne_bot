import type { BotContext } from '../types/context.js';
import { telegramApiCall } from './telegram-api.js';
import { getActiveProxy } from './proxy-fetch.js';
import { normalizeReplyMarkup } from './proxy-api.js';

/** Отправка сообщения через прокси (надёжнее ctx.reply при v2rayTun) */
export async function safeReply(
  ctx: BotContext,
  text: string,
  extra?: Record<string, unknown>,
): Promise<boolean> {
  const chatId = ctx.chat?.id;
  if (!chatId) return false;

  if (getActiveProxy()) {
    const body: Record<string, unknown> = { chat_id: chatId, text, ...extra };
    if (body.reply_markup != null) {
      body.reply_markup = normalizeReplyMarkup(body.reply_markup) ?? body.reply_markup;
    }
    const res = await telegramApiCall('sendMessage', body);
    if (!res.ok) throw new Error(res.description ?? 'sendMessage failed');
    return true;
  }

  await ctx.reply(text, extra as never);
  return true;
}
