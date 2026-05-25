import type { Bot } from 'grammy';
import { GrammyError } from 'grammy';
import type { BotContext } from '../types/context.js';
import { getActiveProxy } from './proxy-fetch.js';
import { telegramApiCall } from './telegram-api.js';

/** Grammy Keyboard / InlineKeyboard → объект для Telegram API */
export function normalizeReplyMarkup(markup: unknown): Record<string, unknown> | undefined {
  if (!markup || typeof markup !== 'object') return undefined;

  const m = markup as Record<string, unknown>;

  if ('inline_keyboard' in m && Array.isArray(m.inline_keyboard)) {
    return { inline_keyboard: m.inline_keyboard };
  }
  if ('keyboard' in m && Array.isArray(m.keyboard)) {
    const out: Record<string, unknown> = { keyboard: m.keyboard };
    if (m.resize_keyboard) out.resize_keyboard = true;
    if (m.is_persistent) out.is_persistent = true;
    if (m.one_time_keyboard) out.one_time_keyboard = true;
    if (m.selective) out.selective = true;
    if (m.input_field_placeholder) out.input_field_placeholder = m.input_field_placeholder;
    return out;
  }
  if ('remove_keyboard' in m || 'force_reply' in m) {
    return m;
  }

  return m;
}

function normalizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const out = { ...payload };
  if (out.reply_markup != null) {
    out.reply_markup = normalizeReplyMarkup(out.reply_markup) ?? out.reply_markup;
  }
  return out;
}

/** Все вызовы ctx.reply / editMessageText / answerCallbackQuery через прокси */
export function installProxyApi(bot: Bot<BotContext>): void {
  if (!getActiveProxy()) return;

  bot.api.config.use(async (_prev, method, payload) => {
    const body = normalizePayload((payload ?? {}) as Record<string, unknown>);
    const data = await telegramApiCall(method, body);

    if (!data.ok) {
      throw new GrammyError(
        `Call to '${method}' failed!`,
        {
          ok: false,
          error_code: 400,
          description: data.description ?? 'API error',
        },
        method,
        body,
      );
    }

    return { ok: true as const, result: data.result } as Awaited<ReturnType<typeof _prev>>;
  });
}
