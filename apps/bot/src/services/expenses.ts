import { getSupabase, hasSupabase } from './supabase.js';

export interface DbExpense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  spent_at: string;
}

const memoryExpenses: DbExpense[] = [];

export async function createExpense(
  userId: string,
  amount: number,
  category: string,
  description?: string,
): Promise<DbExpense> {
  const row = {
    user_id: userId,
    amount,
    category,
    description: description ?? null,
    currency: 'RUB',
    source: 'telegram',
  };

  if (!hasSupabase()) {
    const e: DbExpense = {
      id: crypto.randomUUID(),
      ...row,
      spent_at: new Date().toISOString(),
    };
    memoryExpenses.push(e);
    return e;
  }

  const { data, error } = await getSupabase().from('expenses').insert(row).select().single();
  if (error) throw error;
  return data as DbExpense;
}

export async function getMonthlyReport(userId: string): Promise<{ total: number; byCategory: Record<string, number> }> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const items = !hasSupabase()
    ? memoryExpenses.filter((e) => e.user_id === userId && new Date(e.spent_at) >= start)
    : (
        await getSupabase()
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .gte('spent_at', start.toISOString())
      ).data ?? [];

  const byCategory: Record<string, number> = {};
  let total = 0;
  for (const e of items as DbExpense[]) {
    total += Number(e.amount);
    byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount);
  }
  return { total, byCategory };
}

export function expensesToCsv(expenses: DbExpense[]): string {
  const header = 'date,amount,currency,category,description';
  const rows = expenses.map(
    (e) =>
      `${e.spent_at},${e.amount},${e.currency},${e.category},"${(e.description ?? '').replace(/"/g, '""')}"`,
  );
  return [header, ...rows].join('\n');
}
