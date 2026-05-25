import { Bot, session, type BotConfig } from 'grammy';
import type { UserFromGetMe } from 'grammy/types';
import type { BotContext, SessionData } from './types/context.js';
import { getEnv } from './config.js';
import { accessMiddleware } from './middleware/access.js';
import { errorHandler } from './middleware/error-handler.js';
import { registerHandlers } from './handlers/index.js';
import { getTelegramFetch } from './utils/proxy-fetch.js';
import { installProxyApi } from './utils/proxy-api.js';

function initialSession(): SessionData {
  return {};
}

function buildBotConfig(): BotConfig<BotContext> | undefined {
  const customFetch = getTelegramFetch();
  if (!customFetch) return undefined;

  return {
    client: {
      fetch: customFetch as typeof fetch,
      baseFetchConfig: {},
    },
  } as unknown as BotConfig<BotContext>;
}

export function createBot(botInfo?: UserFromGetMe): Bot<BotContext> {
  const base = buildBotConfig() ?? {};
  const config = botInfo ? { ...base, botInfo } : base;
  const bot = new Bot<BotContext>(getEnv().BOT_TOKEN, config);
  installProxyApi(bot);

  bot.use(session({ initial: initialSession }));
  bot.use(errorHandler);
  bot.use(accessMiddleware);

  registerHandlers(bot);

  return bot;
}
