import type { ItemType } from '@skin-mne/shared';
import { ITEM_TYPE_EMOJI } from '@skin-mne/shared';

export function formatDate(iso: string, timezone = 'Europe/Helsinki'): string {
  return new Date(iso).toLocaleString('ru-RU', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatItemLine(
  content: string,
  type: ItemType,
  createdAt: string,
  timezone?: string,
): string {
  const emoji = ITEM_TYPE_EMOJI[type];
  const date = formatDate(createdAt, timezone);
  const preview = content.length > 80 ? `${content.slice(0, 80)}…` : content;
  return `${emoji} ${preview}\n📅 ${date}`;
}
