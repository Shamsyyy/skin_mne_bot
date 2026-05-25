import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { BTN_SEARCH } from '../keyboards/main.js';
import { searchItems } from '../services/items.js';
import { ensureOwnerUser } from '../services/users.js';
import { ITEM_TYPE_EMOJI, type ItemType } from '@skin-mne/shared';

export function registerSearch(bot: Bot<BotContext>): void {
  bot.hears(BTN_SEARCH, async (ctx) => {
    ctx.session.flow = 'search';
    await ctx.reply('Что ищем? Напиши фразу:');
  });
}

export async function handleSearchText(ctx: BotContext, text: string): Promise<boolean> {
  if (ctx.session.flow !== 'search') return false;

  const user = await ensureOwnerUser(ctx.from!.id);
  const results = await searchItems(user.id, text);
  ctx.session.flow = undefined;

  if (results.length === 0) {
    await ctx.reply('Ничего не нашёл. Попробуй написать короче или другими словами.');
    return true;
  }

  const lines = results.map((r) => {
    const emoji = ITEM_TYPE_EMOJI[r.type as ItemType];
    return `${emoji} ${r.content.slice(0, 60)}`;
  });
  await ctx.reply(`Нашёл ${results.length}:\n\n${lines.join('\n')}`);
  return true;
}
