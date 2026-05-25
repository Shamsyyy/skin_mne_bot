import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { transcribeVoice, isAiEnabled } from '../services/ai.js';
import { tryAiClassify } from './ai.js';
import { saveToInbox } from './inbox.js';

const TMP_DIR = join(process.cwd(), '.tmp');

export function registerVoice(bot: Bot<BotContext>): void {
  bot.on('message:voice', async (ctx) => {
    if (!isAiEnabled()) {
      await ctx.reply('Голосовые доступны при включённом OPENAI_API_KEY. Пока отправь текстом.');
      return;
    }

    const file = await ctx.getFile();
    const filePath = join(TMP_DIR, `${file.file_id}.ogg`);

    try {
      await mkdir(TMP_DIR, { recursive: true });
      const url = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;
      const res = await fetch(url);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(filePath, buf);

      const text = await transcribeVoice(filePath);
      if (!text) {
        await ctx.reply('Не удалось распознать голосовое.');
        return;
      }

      await ctx.reply(`Распознал:\n«${text}»`);

      const handled = await tryAiClassify(ctx, text);
      if (!handled) {
        await saveToInbox(ctx, text);
      }
    } finally {
      await unlink(filePath).catch(() => {});
    }
  });
}
