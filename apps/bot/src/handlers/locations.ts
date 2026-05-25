import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { BTN_LOCATIONS } from '../keyboards/main.js';
import { saveLocation, findObject } from '../services/stored-objects.js';
import { ensureOwnerUser } from '../services/users.js';

const SAVE_REGEX = /^(.+?)\s*[-—]\s*(.+)$/;

export function registerLocations(bot: Bot<BotContext>): void {
  bot.hears(BTN_LOCATIONS, async (ctx) => {
    await ctx.reply(
      '📍 «Где лежит?»\n\nСохранить: «Переходник HDMI — верхний ящик стола»\nНайти: «Где переходник?»',
    );
  });
}

export async function handleLocationText(ctx: BotContext, text: string): Promise<boolean> {
  if (/^где\s+/i.test(text)) {
    const query = text.replace(/^где\s+/i, '').replace(/\?$/, '').trim();
    const user = await ensureOwnerUser(ctx.from!.id);
    const found = await findObject(user.id, query);
    if (found.length === 0) {
      await ctx.reply('Не нашёл. Может, ещё не сохраняли?');
    } else {
      await ctx.reply(found.map((o) => `📍 ${o.object_name}: ${o.location_text}`).join('\n'));
    }
    return true;
  }

  const m = text.match(SAVE_REGEX);
  if (m) {
    const user = await ensureOwnerUser(ctx.from!.id);
    await saveLocation(user.id, m[1].trim(), m[2].trim());
    await ctx.reply(`Запомнил: ${m[1].trim()} → ${m[2].trim()} 📍`);
    return true;
  }

  return false;
}
