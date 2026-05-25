export const EXPENSE_CATEGORIES = [
  'Еда',
  'Авто',
  'Дом',
  'Покупки',
  'Развлечения',
  'Работа',
  'Подписки',
  'Подарки',
  'Другое',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
