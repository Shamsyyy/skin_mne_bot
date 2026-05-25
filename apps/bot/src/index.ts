import { createServer } from 'node:http';
import { createBot } from './bot.js';
import { getEnv } from './config.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  const bot = createBot();
  const env = getEnv();

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

    await bot.api.setWebhook(`${env.WEBHOOK_URL}/webhook`);
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
    await bot.start({
      onStart: () => logger.info('Bot is running'),
    });
  }
}

main().catch((err) => {
  logger.error('Fatal', err);
  process.exit(1);
});
