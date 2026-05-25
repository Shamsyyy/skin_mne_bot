import { getEnv } from '../config.js';
import { getSupabase, hasSupabase } from './supabase.js';
import type { DbUser } from '../types/context.js';

export async function ensureOwnerUser(
  telegramUserId: number,
  firstName?: string,
  username?: string,
): Promise<DbUser> {
  if (!hasSupabase()) {
    return {
      id: '00000000-0000-4000-8000-000000000001',
      telegram_user_id: telegramUserId,
      first_name: firstName ?? null,
      username: username ?? null,
      timezone: getEnv().DEFAULT_TIMEZONE,
      is_owner: true,
    };
  }

  const db = getSupabase();
  const { data: existing } = await db
    .from('users')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();

  if (existing) return existing as DbUser;

  const { data, error } = await db
    .from('users')
    .insert({
      telegram_user_id: telegramUserId,
      first_name: firstName,
      username,
      is_owner: telegramUserId === getEnv().ALLOWED_TELEGRAM_USER_ID,
      timezone: getEnv().DEFAULT_TIMEZONE,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DbUser;
}
