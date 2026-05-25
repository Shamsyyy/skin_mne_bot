import { ProxyAgent, fetch as undiciFetch } from 'undici';
import { getEnv } from '../config.js';
import { getActiveProxy, normalizeProxyUrl } from './proxy-fetch.js';

/** Прямой вызов Telegram API через прокси (обход grammY fetch) */
export async function telegramApiCall(
  method: string,
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  const token = getEnv().BOT_TOKEN;
  const proxy = getActiveProxy();
  const url = `https://api.telegram.org/bot${token}/${method}`;

  const init: Record<string, unknown> = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) init.body = JSON.stringify(body);

  if (proxy) {
    const dispatcher = new ProxyAgent(normalizeProxyUrl(proxy));
    const res = await undiciFetch(url, { ...init, dispatcher } as never);
    return res.json() as Promise<{ ok: boolean; result?: unknown; description?: string }>;
  }

  const res = await fetch(url, init as RequestInit);
  return res.json() as Promise<{ ok: boolean; result?: unknown; description?: string }>;
}

export async function deleteWebhookSafe(): Promise<void> {
  const data = await telegramApiCall('deleteWebhook', { drop_pending_updates: true });
  if (!data.ok) {
    throw new Error(data.description ?? 'deleteWebhook failed');
  }
}

export async function setWebhookSafe(url: string): Promise<void> {
  const data = await telegramApiCall('setWebhook', { url });
  if (!data.ok) {
    throw new Error(data.description ?? 'setWebhook failed');
  }
}
