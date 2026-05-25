import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '../../../.env') });

/** Пустые строки в .env трактуем как «не задано» */
const emptyAsUndefined = (val: unknown) =>
  typeof val === 'string' && val.trim() === '' ? undefined : val;

const optionalUrl = z.preprocess(emptyAsUndefined, z.string().url().optional());
const optionalString = z.preprocess(emptyAsUndefined, z.string().optional());

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BOT_TOKEN: z.string().min(1),
  ALLOWED_TELEGRAM_USER_ID: z.coerce.number().int().positive(),
  DEFAULT_TIMEZONE: z.string().default('Europe/Helsinki'),
  SUPABASE_URL: optionalUrl,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  TELEGRAM_MINI_APP_URL: optionalUrl,
  SESSION_SECRET: optionalString,
  WEBHOOK_URL: optionalUrl,
  TELEGRAM_PROXY: optionalString,
  PORT: z.coerce.number().default(3000),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) {
    cached = EnvSchema.parse(process.env);
  }
  return cached;
}

export function hasSupabase(): boolean {
  const env = getEnv();
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasOpenAI(): boolean {
  return Boolean(getEnv().OPENAI_API_KEY);
}
