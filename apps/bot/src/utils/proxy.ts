import { execSync } from 'node:child_process';
import { ProxyAgent, fetch as undiciFetch } from 'undici';
import { getEnv } from '../config.js';
import { normalizeProxyUrl } from './proxy-fetch.js';

const V2RAYTUN_PORTS = [
  'http://127.0.0.1:10801',
  'socks5://127.0.0.1:10808',
  'http://127.0.0.1:10809',
  'socks5://127.0.0.1:1080',
  'http://127.0.0.1:1080',
  'http://127.0.0.1:20171',
  'socks5://127.0.0.1:20170',
];

export function getWindowsSystemProxy(): string | undefined {
  if (process.platform !== 'win32') return undefined;
  try {
    const script =
      "(Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings' | Select-Object -ExpandProperty ProxyEnable); (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings' | Select-Object -ExpandProperty ProxyServer)";
    const out = execSync(`powershell -NoProfile -Command "${script}"`, {
      encoding: 'utf8',
      timeout: 5000,
    })
      .trim()
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (out[0] !== '1' || !out[1]) return undefined;
    return normalizeProxyUrl(out[1]);
  } catch {
    return undefined;
  }
}

async function testProxy(proxyUrl: string, token: string): Promise<boolean> {
  const proxy = normalizeProxyUrl(proxyUrl);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const agent = new ProxyAgent(proxy);
    const base = `https://api.telegram.org/bot${token}`;
    const me = await undiciFetch(`${base}/getMe`, { signal: ctrl.signal, dispatcher: agent } as never);
    if (!(await me.json() as { ok?: boolean }).ok) return false;

    const wh = await undiciFetch(`${base}/deleteWebhook`, {
      method: 'POST',
      signal: ctrl.signal,
      dispatcher: agent,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: true }),
    } as never);
    const whData = (await wh.json()) as { ok?: boolean };
    clearTimeout(t);
    return Boolean(whData.ok);
  } catch {
    clearTimeout(t);
    return false;
  }
}

export async function resolveTelegramProxy(): Promise<string | undefined> {
  const token = getEnv().BOT_TOKEN;
  const fromEnv = getEnv().TELEGRAM_PROXY;
  const candidates = [
    fromEnv ? normalizeProxyUrl(fromEnv) : undefined,
    getWindowsSystemProxy(),
    ...V2RAYTUN_PORTS,
  ].filter((v): v is string => Boolean(v));

  const unique = [...new Set(candidates)];
  for (const proxy of unique) {
    if (await testProxy(proxy, token)) return proxy;
  }
  return undefined;
}
