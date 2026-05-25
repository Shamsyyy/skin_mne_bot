import { CHECKLIST_TEMPLATES } from '@skin-mne/shared';
import { getSupabase, hasSupabase } from './supabase.js';

export interface DbChecklist {
  id: string;
  title: string;
  items: { id: string; text: string; is_completed: boolean; sort_order: number }[];
}

const memoryChecklists: DbChecklist[] = [];

export async function createFromTemplate(userId: string, templateName: string): Promise<DbChecklist | null> {
  const items = CHECKLIST_TEMPLATES[templateName];
  if (!items) return null;

  if (!hasSupabase()) {
    const cl: DbChecklist = {
      id: crypto.randomUUID(),
      title: templateName,
      items: items.map((text, i) => ({
        id: crypto.randomUUID(),
        text,
        is_completed: false,
        sort_order: i,
      })),
    };
    memoryChecklists.push(cl);
    return cl;
  }

  const { data: cl, error } = await getSupabase()
    .from('checklists')
    .insert({ user_id: userId, title: templateName })
    .select()
    .single();
  if (error) throw error;

  const rows = items.map((text, i) => ({
    checklist_id: cl.id,
    text,
    sort_order: i,
  }));
  await getSupabase().from('checklist_items').insert(rows);

  const { data: checklistItems } = await getSupabase()
    .from('checklist_items')
    .select('*')
    .eq('checklist_id', cl.id)
    .order('sort_order');

  return {
    id: cl.id,
    title: templateName,
    items: (checklistItems ?? []).map((i: { id: string; text: string; is_completed: boolean; sort_order: number }) => ({
      id: i.id,
      text: i.text,
      is_completed: i.is_completed,
      sort_order: i.sort_order,
    })),
  };
}

export function formatChecklist(cl: DbChecklist): string {
  const lines = cl.items.map((i, idx) => `${i.is_completed ? '✅' : '⬜'} ${idx + 1}. ${i.text}`);
  return `📋 ${cl.title}\n\n${lines.join('\n')}`;
}
