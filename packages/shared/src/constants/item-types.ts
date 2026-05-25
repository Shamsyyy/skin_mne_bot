export const ITEM_TYPES = ['task', 'purchase', 'link', 'note', 'inbox'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_STATUSES = ['active', 'done', 'archived', 'deleted'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  task: '✅ Дело',
  purchase: '🛒 Покупка',
  link: '🔗 Ссылка',
  note: '📝 Заметка',
  inbox: '📥 Входящие',
};

export const ITEM_TYPE_EMOJI: Record<ItemType, string> = {
  task: '✅',
  purchase: '🛒',
  link: '🔗',
  note: '📝',
  inbox: '📥',
};
