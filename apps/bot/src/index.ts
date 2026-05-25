import { createServer } from 'node:http';
import { createBot } from './bot.js';
import { getEnv, hasOpenAI } from './config.js';
import { logger } from './utils/logger.js';
import { resolveTelegramProxy } from './utils/proxy.js';
import { setActiveProxy } from './utils/proxy-fetch.js';
import { deleteWebhookSafe, setWebhookSafe, telegramApiCall } from './utils/telegram-api.js';
import { runLongPolling } from './utils/polling.js';
import type { UserFromGetMe } from 'grammy/types';

async function main(): Promise<void> {
  logger.info('Проверка доступа к Telegram API…');
  const proxy = await resolveTelegramProxy();

  if (proxy) {
    setActiveProxy(proxy);
    logger.info(`Прокси: ${proxy.replace(/:[^:@]+@/, ':***@')}`);
    if (hasOpenAI()) logger.info('OpenAI: запросы через тот же прокси');
  } else {
    logger.info('Прокси не найден — пробуем прямое подключение');
    if (hasOpenAI()) {
      logger.warn(
        'OPENAI_API_KEY задан без прокси — возможна ошибка 403. Добавьте TELEGRAM_PROXY=http://127.0.0.1:ПОРТ в .env',
      );
    }
  }

  const env = getEnv();

  const meRes = await telegramApiCall('getMe');
  if (!meRes.ok || !meRes.result) {
    throw new Error(meRes.description ?? 'getMe failed');
  }
  const bot = createBot(meRes.result as UserFromGetMe);

  if (env.WEBHOOK_URL) {
    const port = env.PORT;
    const server = createServer(async (req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        return;
      }
      if (req.url === '/webhook' && req.method === 'POST') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const body = JSON.parse(Buffer.concat(chunks).toString());
        await bot.handleUpdate(body);
        res.writeHead(200);
        res.end('ok');
        return;
      }
      res.writeHead(404);
      res.end();
    });

    await setWebhookSafe(`${env.WEBHOOK_URL}/webhook`);
    server.listen(port, () => logger.info(`Webhook on :${port}`));

    const shutdown = async () => {
      await bot.stop();
      server.close();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } else {
    logger.info('Starting long polling…');
    await deleteWebhookSafe();
    logger.info('Webhook cleared');

    await runLongPolling(bot);
  }
}

main().catch((err) => {
  logger.error('Fatal', err);
  const msg = err instanceof Error ? err.message : String(err);
  if (/network|fetch|ECONNREFUSED|ETIMEDOUT/i.test(msg)) {
    console.error(
      '\n❌ Нет связи с api.telegram.org.\n\n' +
        'v2rayTun (TUN) не даёт прокси для Node.js автоматически.\n' +
        'Сделайте одно из:\n' +
        '  1) v2rayTun → Настройки → включите HTTP-прокси / System proxy\n' +
        '     затем в .env: TELEGRAM_PROXY=http://127.0.0.1:ПОРТ_ИЗ_ПРИЛОЖЕНИЯ\n' +
        '  2) Запустите: node scripts/test-telegram-network.mjs\n' +
        '  3) Или разверните бота на VPS (docs/DEPLOYMENT.md)\n',
    );
  }
  process.exit(1);
});
