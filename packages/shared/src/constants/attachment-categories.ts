export const ATTACHMENT_CATEGORIES = [
  'receipt',
  'warranty',
  'return',
  'instruction',
  'screenshot',
  'other',
] as const;

export type AttachmentCategory = (typeof ATTACHMENT_CATEGORIES)[number];

export const ATTACHMENT_LABELS: Record<AttachmentCategory, string> = {
  receipt: '🧾 Чек',
  warranty: '🛡 Гарантия',
  return: '↩️ Возврат',
  instruction: '📖 Инструкция',
  screenshot: '📷 Скриншот',
  other: '📁 Другое',
};
