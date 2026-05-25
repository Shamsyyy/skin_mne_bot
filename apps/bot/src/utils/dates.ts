import { getEnv } from '../config.js';

export type TimePreset = 'today_evening' | 'tomorrow_morning' | 'tomorrow_evening';

export function resolvePreset(preset: TimePreset, timezone?: string): Date {
  const tz = timezone ?? getEnv().DEFAULT_TIMEZONE;
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [year, month, day] = formatter.format(now).split('-').map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));

  switch (preset) {
    case 'today_evening':
      base.setUTCHours(20, 0, 0, 0);
      if (base <= now) base.setUTCDate(base.getUTCDate() + 1);
      return base;
    case 'tomorrow_morning':
      base.setUTCDate(base.getUTCDate() + 1);
      base.setUTCHours(9, 0, 0, 0);
      return base;
    case 'tomorrow_evening':
      base.setUTCDate(base.getUTCDate() + 1);
      base.setUTCHours(20, 0, 0, 0);
      return base;
  }
}

export function addRecurrence(date: Date, rule: string): Date {
  const next = new Date(date);
  switch (rule) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}
