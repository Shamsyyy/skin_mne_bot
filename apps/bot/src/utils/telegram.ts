import type { Context } from 'grammy';

export function isPrivateChat(ctx: Context): boolean {
  return ctx.chat?.type === 'private';
}
