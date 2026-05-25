import { Bot, session, type BotConfig } from 'grammy';
import { ProxyAgent, fetch as undiciFetch } from 'undici';
import type { BotContext, SessionData } from './types/context.js';
import { getEnv } from './config.js';
import { accessMiddleware } from './middleware/access.js';
import { errorHandler } from './middleware/error-handler.js';
import { registerHandlers } from './handlers/index.js';

function initialSession(): SessionData {
  return {};
}

function buildBotConfig(): BotConfig<BotContext> | undefined {
  const proxy = getEnv().TELEGRAM_PROXY;
  if (!proxy) return undefined;

  const dispatcher = new ProxyAgent(proxy);
  const customFetch = (url: string | URL, init?: RequestInit) =>
    undiciFetch(url, { ...init, dispatcher } as never) as unknown as Promise<Response>;

  return {
    client: { fetch: customFetch as typeof fetch },
  } as unknown as BotConfig<BotContext>;
}

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(getEnv().BOT_TOKEN, buildBotConfig());

  bot.use(session({ initial: initialSession }));
  bot.use(errorHandler);
  bot.use(accessMiddleware);

  registerHandlers(bot);

  return bot;
}
