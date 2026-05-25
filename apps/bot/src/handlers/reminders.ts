import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { BTN_REMINDERS, BTN_UPCOMING } from '../keyboards/main.js';
import { reminderTimeKeyboard, reminderSentKeyboard } from '../keyboards/inline.js';
import { createReminder, listUpcoming, cancelReminder, snoozeReminder } from '../services/reminders.js';
import { ensureOwnerUser } from '../services/users.js';
import { getItem } from '../services/items.js';
import { resolvePreset, type TimePreset } from '../utils/dates.js';
import { formatDate } from '../utils/format.js';

export function registerReminders(bot: Bot<BotContext>): void {
  bot.hears(BTN_REMINDERS, async (ctx) => {
    await ctx.reply('⏰ Напоминания', {
      reply_markup: { inline_keyboard: [[{ text: '➕ Новое напоминание', callback_data: 'rem:new' }]] },
    });
  });

  bot.callbackQuery('rem:new', async (ctx) => {
    ctx.session.flow = 'reminder_text';
    await ctx.answerCallbackQuery();
    await ctx.reply('О чём напомнить?');
  });

  bot.hears(BTN_UPCOMING, async (ctx) => {
    const user = await ensureOwnerUser(ctx.from!.id);
    const list = await listUpcoming(user.id);
    if (list.length === 0) {
      await ctx.reply('Ближайших напоминаний нет.');
      return;
    }
    const text = list
      .map((r, i) => `${i + 1}. ${r.title} — ${formatDate(r.remind_at, user.timezone)}`)
      .join('\n');
    await ctx.reply(`📅 Ближайшие:\n\n${text}`);
  });

  bot.callbackQuery(/^rem:(.+)$/, async (ctx) => {
    const preset = ctx.match[1];
    const title = ctx.session.pendingText ?? 'Напоминание';
    const user = await ensureOwnerUser(ctx.from!.id);

    let remindAt: Date;
    let recurrence: string | null = null;

    if (['today_evening', 'tomorrow_morning', 'tomorrow_evening'].includes(preset)) {
      remindAt = resolvePreset(preset as TimePreset, user.timezone);
    } else if (['daily', 'weekly', 'monthly'].includes(preset)) {
      remindAt = resolvePreset('tomorrow_morning', user.timezone);
      recurrence = preset;
    } else {
      remindAt = resolvePreset('today_evening', user.timezone);
    }

    await createReminder(user.id, {
      title,
      remind_at: remindAt.toISOString(),
      item_id: ctx.session.pendingItemId,
      recurrence_rule: recurrence,
      timezone: user.timezone,
    });

    ctx.session.flow = undefined;
    ctx.session.pendingText = undefined;
    ctx.session.pendingItemId = undefined;

    await ctx.editMessageText(
      `⏰ Напоминание на ${formatDate(remindAt.toISOString(), user.timezone)}${recurrence ? ` (${recurrence})` : ''}`,
    );
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^rsent:(.+):(.+)$/, async (ctx) => {
    const action = ctx.match[1];
    const reminderId = ctx.match[2];
    const user = await ensureOwnerUser(ctx.from!.id);

    if (action === 'done') {
      await cancelReminder(user.id, reminderId);
      await ctx.editMessageText('Готово ✅');
    } else if (action === '1h') {
      const d = new Date();
      d.setHours(d.getHours() + 1);
      await snoozeReminder(user.id, reminderId, d);
      await ctx.editMessageText('Перенёс на час ⏰');
    } else if (action === 'tm') {
      await snoozeReminder(user.id, reminderId, resolvePreset('tomorrow_morning', user.timezone));
      await ctx.editMessageText('Перенёс на завтра утром 🌅');
    } else if (action === 'cancel') {
      await cancelReminder(user.id, reminderId);
      await ctx.editMessageText('Отменил ❌');
    }
    await ctx.answerCallbackQuery();
  });
}

export async function handleReminderText(ctx: BotContext, text: string): Promise<boolean> {
  if (ctx.session.flow !== 'reminder_text') return false;

  if (ctx.session.pendingItemId && text.toLowerCase() === 'да') {
    const user = await ensureOwnerUser(ctx.from!.id);
    const item = await getItem(user.id, ctx.session.pendingItemId);
    ctx.session.pendingText = item?.content ?? 'Напоминание';
  } else {
    ctx.session.pendingText = text;
  }

  ctx.session.flow = 'reminder_time';
  await ctx.reply('Когда напомнить?', { reply_markup: reminderTimeKeyboard() });
  return true;
}

export { reminderSentKeyboard };
