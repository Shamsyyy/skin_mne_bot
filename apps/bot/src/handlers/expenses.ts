import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { BTN_EXPENSES } from '../keyboards/main.js';
import { createExpense, getMonthlyReport } from '../services/expenses.js';
import { ensureOwnerUser } from '../services/users.js';

const EXPENSE_REGEX = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*$/;

export function registerExpenses(bot: Bot<BotContext>): void {
  bot.hears(BTN_EXPENSES, async (ctx) => {
    const user = await ensureOwnerUser(ctx.from!.id);
    const report = await getMonthlyReport(user.id);
    const cats = Object.entries(report.byCategory)
      .map(([c, a]) => `  ${c}: ${a} ₽`)
      .join('\n');
    await ctx.reply(
      `💸 Расходы за месяц: ${report.total} ₽\n${cats || '  (пусто)'}`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: '➕ Добавить расход', callback_data: 'exp:add' }]],
        },
      },
    );
  });

  bot.callbackQuery('exp:add', async (ctx) => {
    ctx.session.flow = 'expense_amount';
    await ctx.answerCallbackQuery();
    await ctx.reply('Напиши расход, например: «Кафе 650» или «Бензин 3400»');
  });
}

export async function tryParseExpense(ctx: BotContext, text: string): Promise<boolean> {
  if (ctx.session.flow === 'expense_amount' || EXPENSE_REGEX.test(text)) {
    const m = text.match(EXPENSE_REGEX);
    if (!m) {
      if (ctx.session.flow === 'expense_amount') {
        await ctx.reply('Формат: «описание сумма», например «Кафе 650»');
        return true;
      }
      return false;
    }

    const desc = m[1].trim();
    const amount = parseFloat(m[2].replace(',', '.'));
    const category = guessCategory(desc);

    const user = await ensureOwnerUser(ctx.from!.id);
    await createExpense(user.id, amount, category, desc);
    ctx.session.flow = undefined;
    await ctx.reply(`Сохранил расход: ${desc} — ${amount} ₽ (${category}) 💸`);
    return true;
  }
  return false;
}

function guessCategory(desc: string): string {
  const d = desc.toLowerCase();
  if (/бензин|авто|топлив|парков/i.test(d)) return 'Авто';
  if (/кафе|еда|рестор|обед|продукт/i.test(d)) return 'Еда';
  if (/ozon|wildberries|покуп/i.test(d)) return 'Покупки';
  return 'Другое';
}
