import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config.js', () => ({
  getEnv: () => ({ ALLOWED_TELEGRAM_USER_ID: 12345 }),
}));

import { accessMiddleware } from '../../src/middleware/access.js';

describe('accessMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects non-private chat', async () => {
    const reply = vi.fn();
    const next = vi.fn();
    const ctx = {
      chat: { type: 'group' },
      from: { id: 12345 },
      reply,
    } as never;

    await accessMiddleware(ctx, next);
    expect(reply).toHaveBeenCalledWith('Этот бот работает только в личном чате.');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects wrong user id', async () => {
    const reply = vi.fn();
    const next = vi.fn();
    const ctx = {
      chat: { type: 'private' },
      from: { id: 99999 },
      reply,
    } as never;

    await accessMiddleware(ctx, next);
    expect(reply).toHaveBeenCalledWith('Этот бот приватный');
    expect(next).not.toHaveBeenCalled();
  });

  it('allows owner in private chat', async () => {
    const reply = vi.fn();
    const next = vi.fn();
    const ctx = {
      chat: { type: 'private' },
      from: { id: 12345 },
      reply,
    } as never;

    await accessMiddleware(ctx, next);
    expect(next).toHaveBeenCalled();
    expect(reply).not.toHaveBeenCalled();
  });
});
