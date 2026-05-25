import { Bot } from 'grammy';
import { getEnv } from '../config.js';
import {
  claimDueReminders,
  markReminderSent,
  markReminderFailed,
} from '../services/reminders.js';
import { reminderSentKeyboard } from '../handlers/reminders.js';
import { logger } from '../utils/logger.js';

const POLL_MS = 30_000;

async function dispatch(): Promise<void> {
  const bot = new Bot(getEnv().BOT_TOKEN);
  const due = await claimDueReminders(10);

  for (const r of due) {
    try {
      const { hasSupabase, getSupabase } = await import('../services/supabase.js');
      const { data: user } = hasSupabase()
        ? await getSupabase().from('users').select('telegram_user_id').eq('id', r.user_id).single()
        : { data: { telegram_user_id: getEnv().ALLOWED_TELEGRAM_USER_ID } };

      const chatId = user?.telegram_user_id ?? getEnv().ALLOWED_TELEGRAM_USER_ID;
      const msg = await bot.api.sendMessage(chatId, `⏰ ${r.title}`, {
        reply_markup: reminderSentKeyboard(r.id),
      });

      await markReminderSent(r.id, msg.message_id, r.recurrence_rule, r.remind_at);
    } catch (err) {
      await markReminderFailed(r.id, err instanceof Error ? err.message : 'unknown');
      logger.error('Reminder dispatch failed', err);
    }
  }
}

async function loop(): Promise<void> {
  try {
    await dispatch();
  } catch (err) {
    logger.error('Dispatch loop error', err);
  }
  setTimeout(loop, POLL_MS);
}

logger.info('Reminder worker started');
loop();
