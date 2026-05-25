/**
 * Проверка OPENAI_API_KEY через прокси (как в боте).
 * Запуск: node scripts/test-openai.mjs "купить молоко завтра"
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });

function normalizeProxy(raw) {
  let u = raw.trim();
  if (/^https:\/\//i.test(u)) u = `http://${u.slice(8)}`;
  else if (/^http:\/\//i.test(u)) u = `http://${u.slice(7)}`;
  else if (!u.includes('://')) u = `http://${u}`;
  return u;
}

const key = process.env.OPENAI_API_KEY?.trim();
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const proxyRaw = process.env.TELEGRAM_PROXY?.trim();
const text = process.argv[2] || 'напомни завтра в 10 позвонить маме';

if (!key) {
  console.log('NO_KEY: добавьте OPENAI_API_KEY в .env');
  process.exit(1);
}

let fetchFn;
if (proxyRaw) {
  const proxy = normalizeProxy(proxyRaw);
  const dispatcher = new ProxyAgent(proxy);
  fetchFn = (input, init) => {
    const clean = { ...(init ?? {}) };
    delete clean.agent;
    return undiciFetch(input, { ...clean, dispatcher });
  };
  console.log('proxy:', proxy);
} else {
  console.log('WARN: TELEGRAM_PROXY не задан — возможна ошибка 403');
}

const client = new OpenAI({ apiKey: key, ...(fetchFn ? { fetch: fetchFn } : {}) });

try {
  const response = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Ты классификатор для личного бота «Скинь мне». Верни JSON с полями intent, confidence, clarificationNeeded.`,
      },
      { role: 'user', content: text },
    ],
  });
  const raw = response.choices[0]?.message?.content;
  console.log('OK', model);
  console.log('input:', text);
  console.log('json:', raw);
} catch (e) {
  console.log('FAIL:', e.message);
  if (/403|country/i.test(e.message)) {
    console.log('→ Включите v2rayTun и TELEGRAM_PROXY=http://127.0.0.1:10801 в .env');
  }
  process.exit(1);
}
