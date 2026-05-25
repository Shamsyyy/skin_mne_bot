import OpenAI, { type ClientOptions } from 'openai';
import { getEnv } from '../config.js';
import { getProxyFetch } from './proxy-fetch.js';

let client: OpenAI | undefined;

/** OpenAI-клиент; при активном прокси (v2rayTun) обходит 403 по региону */
export function getOpenAIClient(): OpenAI {
  if (!client) {
    const env = getEnv();
    const proxyFetch = getProxyFetch();
    const opts: ClientOptions = { apiKey: env.OPENAI_API_KEY };
    if (proxyFetch) opts.fetch = proxyFetch as unknown as ClientOptions['fetch'];
    client = new OpenAI(opts);
  }
  return client;
}

export function resetOpenAIClient(): void {
  client = undefined;
}
