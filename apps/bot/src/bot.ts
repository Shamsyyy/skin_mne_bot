import { Bot, session } from 'grammy';
import type { BotContext, SessionData } from './types/context.js';
import { getEnv } from './config.js';
import { accessMiddleware } from './middleware/access.js';
import { errorHandler } from './middleware/error-handler.js';
import { registerHandlers } from './handlers/index.js';

function initialSession(): SessionData {
  return {};
}

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(getEnv().BOT_TOKEN);

  bot.use(session({ initial: initialSession }));
  bot.use(errorHandler);
  bot.use(accessMiddleware);

  registerHandlers(bot);

  return bot;
}
