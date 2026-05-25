import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { classifyText, isAiEnabled } from '../services/ai.js';
import { aiConfirmKeyboard } from '../keyboards/inline.js';
import { createItem } from '../services/items.js';
import { createReminder } from '../services/reminders.js';
import { createExpense } from '../services/expenses.js';
import { saveLocation } from '../services/stored-objects.js';
import { ensureOwnerUser } from '../services/users.js';
import { ITEM_TYPE_LABELS, type ItemType } from '@skin-mne/shared';
import { resolvePreset } from '../utils/dates.js';
import { searchItems } from '../services/items.js';

export async function tryAiClassify(ctx: BotContext, text: string): Promise<boolean> {
  if (!isAiEnabled() || ctx.session.flow) return false;

  const intent = await classifyText(text);
  if (!intent || intent.intent === 'unknown') return false;

  if (intent.clarificationNeeded) {
    ctx.session.pendingAiIntent = intent;
    ctx.session.flow = 'ai_confirm';
    const summary = buildSummary(intent);
    await ctx.reply(`Понял так:\n${summary}\n\nВерно?`, { reply_markup: aiConfirmKeyboard() });
    return true;
  }

  await executeAiIntent(ctx, intent);
  return true;
}

function buildSummary(intent: NonNullable<BotContext['session']['pendingAiIntent']>): string {
  const parts: string[] = [];
  if (intent.itemType) parts.push(`Тип: ${ITEM_TYPE_LABELS[intent.itemType as ItemType]}`);
  if (intent.content) parts.push(`Текст: ${intent.content}`);
  if (intent.reminderText) parts.push(`Напоминание: ${intent.reminderText}`);
  if (intent.expenseAmount) parts.push(`Расход: ${intent.expenseAmount} ₽ (${intent.expenseCategory ?? 'Другое'})`);
  if (intent.objectName) parts.push(`Предмет: ${intent.objectName} → ${intent.locationText}`);
  return parts.join('\n') || 'Не удалось разобрать';
}

async function executeAiIntent(ctx: BotContext, intent: NonNullable<BotContext['session']['pendingAiIntent']>): Promise<void> {
  const user = await ensureOwnerUser(ctx.from!.id);

  switch (intent.intent) {
    case 'create_item':
      await createItem(user.id, {
        type: (intent.itemType as ItemType) ?? 'inbox',
        content: intent.content ?? intent.title ?? '',
        url: intent.url,
        source: 'ai',
      });
      await ctx.reply(`Сохранил в «${ITEM_TYPE_LABELS[(intent.itemType as ItemType) ?? 'inbox']}» ✅`);
      if (intent.reminderText || intent.remindAt) {
        await createReminder(user.id, {
          title: intent.reminderText ?? intent.content ?? 'Напоминание',
          remind_at: intent.remindAt ?? resolvePreset('tomorrow_evening', user.timezone).toISOString(),
          timezone: user.timezone,
        });
        await ctx.reply('И поставил напоминание ⏰');
      }
      break;
    case 'create_reminder':
      await createReminder(user.id, {
        title: intent.reminderText ?? intent.content ?? 'Напоминание',
        remind_at: intent.remindAt ?? resolvePreset('tomorrow_morning', user.timezone).toISOString(),
        timezone: user.timezone,
      });
      await ctx.reply('Напоминание создано ⏰');
      break;
    case 'create_expense':
      await createExpense(user.id, intent.expenseAmount ?? 0, intent.expenseCategory ?? 'Другое', intent.content);
      await ctx.reply(`Расход ${intent.expenseAmount} ₽ сохранён 💸`);
      break;
    case 'save_location':
      await saveLocation(user.id, intent.objectName ?? 'Предмет', intent.locationText ?? '');
      await ctx.reply(`Запомнил: ${intent.objectName} → ${intent.locationText} 📍`);
      break;
    case 'search': {
      const results = await searchItems(user.id, intent.content ?? '');
      await ctx.reply(results.length ? `Нашёл ${results.length} записей` : 'Ничего не нашёл');
      break;
    }
  }
}

export function registerAi(bot: Bot<BotContext>): void {
  bot.callbackQuery('ai:save', async (ctx) => {
    const intent = ctx.session.pendingAiIntent;
    if (!intent) {
      await ctx.answerCallbackQuery();
      return;
    }
    await executeAiIntent(ctx, intent);
    ctx.session.pendingAiIntent = undefined;
    ctx.session.flow = undefined;
    await ctx.editMessageText('Сохранено ✅');
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('ai:cancel', async (ctx) => {
    ctx.session.pendingAiIntent = undefined;
    ctx.session.flow = undefined;
    await ctx.editMessageText('Отменено');
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('ai:edit', async (ctx) => {
    ctx.session.flow = 'record_text';
    await ctx.editMessageText('Напиши заново, как сохранить:');
    await ctx.answerCallbackQuery();
  });
}
