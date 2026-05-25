import { createHmac } from 'node:crypto';

const BOT_TOKEN = Deno.env.get('BOT_TOKEN')!;
const ALLOWED_ID = Number(Deno.env.get('ALLOWED_TELEGRAM_USER_ID'));
const MAX_AGE_SEC = 86400;

function validateInitData(initData: string): { userId: number } | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calculated = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculated !== hash) return null;

  const authDate = Number(params.get('auth_date'));
  if (Date.now() / 1000 - authDate > MAX_AGE_SEC) return null;

  const user = JSON.parse(params.get('user') ?? '{}');
  if (user.id !== ALLOWED_ID) return null;

  return { userId: user.id };
}

Deno.serve(async (req) => {
  const initData = req.headers.get('X-Telegram-Init-Data') ?? '';
  const result = validateInitData(initData);

  if (!result) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  const sessionToken = crypto.randomUUID();
  return new Response(JSON.stringify({ sessionToken, userId: result.userId }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
