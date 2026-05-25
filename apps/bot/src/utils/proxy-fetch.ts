import { ProxyAgent, fetch as undiciFetch } from 'undici';

let activeProxy: string | undefined;
let dispatcher: ProxyAgent | undefined;

export function normalizeProxyUrl(raw: string): string {
  let u = raw.trim();
  if (/^https:\/\//i.test(u)) u = `http://${u.slice(8)}`;
  else if (/^http:\/\//i.test(u)) u = `http://${u.slice(7)}`;
  else if (!u.includes('://')) u = `http://${u}`;
  return u;
}

export function setActiveProxy(proxy?: string): void {
  activeProxy = proxy ? normalizeProxyUrl(proxy) : undefined;
  dispatcher = activeProxy ? new ProxyAgent(activeProxy) : undefined;
}

export function getActiveProxy(): string | undefined {
  return activeProxy;
}

/** fetch через активный прокси (Telegram, OpenAI и др.) */
export function getProxyFetch(): typeof fetch | undefined {
  return getTelegramFetch();
}

/** fetch для grammY — поддерживает Request и прокси undici */
export function getTelegramFetch(): typeof fetch | undefined {
  if (!dispatcher) return undefined;

  const proxyFetch = (input: string | URL | Request, init?: RequestInit) => {
    // grammY добавляет node https.Agent — он ломает ProxyAgent undici
    const clean = { ...(init as Record<string, unknown>) };
    delete clean.agent;
    delete clean.compress;
    const opts = { ...clean, dispatcher } as never;
    return undiciFetch(input as never, opts) as unknown as Promise<Response>;
  };

  return proxyFetch as typeof fetch;
}
