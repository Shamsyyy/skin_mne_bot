import type { BotContext } from '../types/context.js';
import { extractUrls } from '../utils/url.js';
import { createItem } from '../services/items.js';
import { ensureOwnerUser } from '../services/users.js';
import { categoryPickerKeyboard } from '../keyboards/inline.js';

export async function handleLinkMessage(ctx: BotContext, text: string): Promise<boolean> {
  const urls = extractUrls(text);
  if (urls.length === 0) return false;

  const url = urls[0];
  const description = text.replace(url, '').trim() || url;

  ctx.session.pendingText = description;
  ctx.session.pendingUrl = url;
  ctx.session.flow = 'record_category';

  await ctx.reply(`Нашёл ссылку:\n${url}\n\nСохранить как ссылку?`, {
    reply_markup: categoryPickerKeyboard(),
  });
  return true;
}

export async function saveAsLink(ctx: BotContext): Promise<void> {
  const user = await ensureOwnerUser(ctx.from!.id);
  await createItem(user.id, {
    type: 'link',
    content: ctx.session.pendingText ?? '',
    url: ctx.session.pendingUrl,
  });
  ctx.session.flow = undefined;
  ctx.session.pendingText = undefined;
  ctx.session.pendingUrl = undefined;
  await ctx.reply('Сохранил в «Ссылки» 🔗');
}
