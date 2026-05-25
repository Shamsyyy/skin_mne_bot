import type { Bot } from 'grammy';
import type { Update } from 'grammy/types';
import type { BotContext } from '../types/context.js';
import { telegramApiCall } from './telegram-api.js';
import { logger } from './logger.js';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Long polling без bot.start() — обход бесконечных retry grammY */
export async function runLongPolling(bot: Bot<BotContext>): Promise<void> {
  const username = bot.botInfo.username;
  logger.info(`Bot is running @${username}`);

  let offset = 0;

  while (true) {
    try {
      const data = await telegramApiCall('getUpdates', {
        offset,
        timeout: 25,
      });

      if (!data.ok) {
        const desc = data.description ?? '';
        if (desc.includes('Conflict')) {
          logger.error(
            'Запущено несколько ботов! Закройте лишние терминалы и выполните: scripts\\stop-bot.cmd',
          );
          await sleep(10000);
        } else {
          logger.error('getUpdates error', desc);
          await sleep(3000);
        }
        continue;
      }

      const updates = (data.result ?? []) as Update[];
      for (const update of updates) {
        offset = update.update_id + 1;
        await bot.handleUpdate(update);
      }
    } catch (err) {
      logger.error('Polling loop error', err);
      await sleep(3000);
    }
  }
}
