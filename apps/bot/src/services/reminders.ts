import { getSupabase, hasSupabase } from './supabase.js';
import type { DbReminder } from '../types/context.js';
import { addRecurrence } from '../utils/dates.js';

const memoryReminders: DbReminder[] = [];

export async function createReminder(
  userId: string,
  input: {
    title: string;
    remind_at: string;
    item_id?: string;
    recurrence_rule?: string | null;
    timezone?: string;
  },
): Promise<DbReminder> {
  const row = {
    user_id: userId,
    title: input.title,
    remind_at: input.remind_at,
    item_id: input.item_id ?? null,
    recurrence_rule: input.recurrence_rule ?? null,
    timezone: input.timezone ?? 'Europe/Helsinki',
    status: 'scheduled',
  };

  if (!hasSupabase()) {
    const r: DbReminder = {
      id: crypto.randomUUID(),
      ...row,
      sent_at: null,
      telegram_message_id: null,
    };
    memoryReminders.push(r);
    return r;
  }

  const { data, error } = await getSupabase().from('reminders').insert(row).select().single();
  if (error) throw error;
  return data as DbReminder;
}

export async function listUpcoming(userId: string, limit = 10): Promise<DbReminder[]> {
  const now = new Date().toISOString();

  if (!hasSupabase()) {
    return memoryReminders
      .filter((r) => r.user_id === userId && r.status === 'scheduled')
      .sort((a, b) => a.remind_at.localeCompare(b.remind_at))
      .slice(0, limit);
  }

  const { data, error } = await getSupabase()
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .gte('remind_at', now)
    .order('remind_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as DbReminder[];
}

export async function cancelReminder(userId: string, reminderId: string): Promise<void> {
  if (!hasSupabase()) {
    const r = memoryReminders.find((x) => x.id === reminderId && x.user_id === userId);
    if (r) r.status = 'cancelled';
    return;
  }
  await getSupabase()
    .from('reminders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', reminderId)
    .eq('user_id', userId);
}

export async function snoozeReminder(
  userId: string,
  reminderId: string,
  newAt: Date,
): Promise<void> {
  const iso = newAt.toISOString();
  if (!hasSupabase()) {
    const r = memoryReminders.find((x) => x.id === reminderId && x.user_id === userId);
    if (r) {
      r.remind_at = iso;
      r.status = 'scheduled';
    }
    return;
  }
  await getSupabase()
    .from('reminders')
    .update({ remind_at: iso, status: 'scheduled', updated_at: new Date().toISOString() })
    .eq('id', reminderId)
    .eq('user_id', userId);
}

export async function claimDueReminders(limit = 10): Promise<DbReminder[]> {
  if (!hasSupabase()) {
    const due = memoryReminders.filter(
      (r) => r.status === 'scheduled' && new Date(r.remind_at) <= new Date(),
    );
    for (const r of due.slice(0, limit)) {
      r.status = 'processing';
    }
    return due.slice(0, limit);
  }

  const { data, error } = await getSupabase().rpc('claim_due_reminders', { p_limit: limit });
  if (error) throw error;
  return (data ?? []) as DbReminder[];
}

export async function markReminderSent(
  reminderId: string,
  telegramMessageId: number,
  recurrenceRule?: string | null,
  remindAt?: string,
): Promise<void> {
  if (!hasSupabase()) {
    const r = memoryReminders.find((x) => x.id === reminderId);
    if (!r) return;
    r.status = 'sent';
    r.sent_at = new Date().toISOString();
    r.telegram_message_id = telegramMessageId;
    if (recurrenceRule && remindAt) {
      const next = addRecurrence(new Date(remindAt), recurrenceRule);
      memoryReminders.push({
        ...r,
        id: crypto.randomUUID(),
        status: 'scheduled',
        remind_at: next.toISOString(),
        sent_at: null,
        telegram_message_id: null,
      });
    }
    return;
  }

  await getSupabase()
    .from('reminders')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      telegram_message_id: telegramMessageId,
    })
    .eq('id', reminderId);

  if (recurrenceRule && remindAt) {
    const r = memoryReminders.find((x) => x.id === reminderId);
    const userId = r?.user_id;
    if (userId) {
      const next = addRecurrence(new Date(remindAt), recurrenceRule);
      await createReminder(userId, {
        title: r!.title,
        remind_at: next.toISOString(),
        item_id: r!.item_id ?? undefined,
        recurrence_rule: recurrenceRule,
        timezone: r!.timezone,
      });
    }
  }
}

export async function markReminderFailed(reminderId: string, errorMessage: string): Promise<void> {
  if (!hasSupabase()) {
    const r = memoryReminders.find((x) => x.id === reminderId);
    if (r) {
      r.status = 'failed';
    }
    return;
  }
  await getSupabase()
    .from('reminders')
    .update({ status: 'failed', error_message: errorMessage })
    .eq('id', reminderId);
}

export function clearMemoryReminders(): void {
  memoryReminders.length = 0;
}

export function getMemoryReminders(): DbReminder[] {
  return memoryReminders;
}
