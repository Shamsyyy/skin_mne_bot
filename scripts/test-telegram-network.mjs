import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });

const token = process.env.BOT_TOKEN;
if (!token) {
  console.log('NO_TOKEN');
  process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/getMe`;

async function tryFetch(label, options = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await undiciFetch(url, { signal: ctrl.signal, ...options });
    const data = await res.json();
    clearTimeout(t);
    if (data.ok) return { ok: true, label, user: data.result.username };
    return { ok: false, label, err: data.description };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, label, err: e.message };
  }
}

const ports = [
  process.env.TELEGRAM_PROXY,
  'http://127.0.0.1:7890',
  'http://127.0.0.1:7897',
  'socks5://127.0.0.1:7891',
  'socks5://127.0.0.1:7890',
  'http://127.0.0.1:10809',
  'http://127.0.0.1:10808',
  'http://127.0.0.1:8080',
].filter(Boolean);

console.log('Testing api.telegram.org/getMe...\n');

const direct = await tryFetch('direct (no proxy)');
console.log(direct.ok ? `OK  ${direct.label} @${direct.user}` : `FAIL ${direct.label}: ${direct.err}`);

for (const proxy of [...new Set(ports)]) {
  const dispatcher = new ProxyAgent(proxy);
  const r = await tryFetch(`proxy ${proxy}`, { dispatcher });
  console.log(r.ok ? `OK  ${r.label} @${r.user}` : `FAIL ${r.label}: ${r.err}`);
}
