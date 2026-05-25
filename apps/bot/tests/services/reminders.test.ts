import { describe, it, expect, beforeEach } from 'vitest';
import {
  createReminder,
  claimDueReminders,
  cancelReminder,
  snoozeReminder,
  clearMemoryReminders,
  getMemoryReminders,
} from '../../src/services/reminders.js';

const USER = '00000000-0000-4000-8000-000000000001';

describe('reminders service (memory)', () => {
  beforeEach(() => {
    clearMemoryReminders();
  });

  it('creates reminder', async () => {
    const r = await createReminder(USER, {
      title: 'Test',
      remind_at: new Date(Date.now() + 3600000).toISOString(),
    });
    expect(r.status).toBe('scheduled');
  });

  it('claims due reminders once', async () => {
    await createReminder(USER, {
      title: 'Due',
      remind_at: new Date(Date.now() - 1000).toISOString(),
    });
    const first = await claimDueReminders();
    expect(first).toHaveLength(1);
    expect(first[0].status).toBe('processing');

    const second = await claimDueReminders();
    expect(second).toHaveLength(0);
  });

  it('cancels reminder', async () => {
    const r = await createReminder(USER, {
      title: 'X',
      remind_at: new Date().toISOString(),
    });
    await cancelReminder(USER, r.id);
    const mem = getMemoryReminders().find((x) => x.id === r.id);
    expect(mem?.status).toBe('cancelled');
  });

  it('snoozes reminder', async () => {
    const r = await createReminder(USER, {
      title: 'X',
      remind_at: new Date().toISOString(),
    });
    const later = new Date(Date.now() + 7200000);
    await snoozeReminder(USER, r.id, later);
    const mem = getMemoryReminders().find((x) => x.id === r.id);
    expect(mem?.status).toBe('scheduled');
    expect(new Date(mem!.remind_at).getTime()).toBe(later.getTime());
  });
});
