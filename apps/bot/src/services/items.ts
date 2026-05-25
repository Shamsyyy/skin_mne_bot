import type { ItemType } from '@skin-mne/shared';
import { getSupabase, hasSupabase } from './supabase.js';
import type { DbItem } from '../types/context.js';

const memoryStore: DbItem[] = [];

function memFilter(userId: string, type?: ItemType, status = 'active') {
  return memoryStore.filter(
    (i) => i.user_id === userId && i.status === status && (!type || i.type === type),
  );
}

export async function createItem(
  userId: string,
  input: {
    type: ItemType;
    content: string;
    title?: string;
    url?: string;
    source?: string;
  },
): Promise<DbItem> {
  const row = {
    user_id: userId,
    type: input.type,
    content: input.content,
    title: input.title ?? null,
    url: input.url ?? null,
    source: input.source ?? 'telegram',
    status: 'active',
  };

  if (!hasSupabase()) {
    const item: DbItem = {
      id: crypto.randomUUID(),
      ...row,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };
    memoryStore.push(item);
    return item;
  }

  const { data, error } = await getSupabase().from('items').insert(row).select().single();
  if (error) throw error;
  return data as DbItem;
}

export async function listItems(
  userId: string,
  type?: ItemType,
  limit = 10,
): Promise<DbItem[]> {
  if (!hasSupabase()) {
    return memFilter(userId, type)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  let q = getSupabase()
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type) q = q.eq('type', type);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DbItem[];
}

export async function searchItems(userId: string, query: string, limit = 10): Promise<DbItem[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  if (!hasSupabase()) {
    return memFilter(userId, undefined, 'active')
      .filter(
        (i) =>
          i.content.toLowerCase().includes(q) ||
          (i.title?.toLowerCase().includes(q) ?? false) ||
          (i.url?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, limit);
  }

  const { data, error } = await getSupabase()
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .or(`content.ilike.%${q}%,title.ilike.%${q}%,url.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as DbItem[];
}

export async function getItem(userId: string, itemId: string): Promise<DbItem | null> {
  if (!hasSupabase()) {
    return memoryStore.find((i) => i.id === itemId && i.user_id === userId) ?? null;
  }
  const { data } = await getSupabase()
    .from('items')
    .select('*')
    .eq('id', itemId)
    .eq('user_id', userId)
    .maybeSingle();
  return (data as DbItem) ?? null;
}

export async function updateItemStatus(
  userId: string,
  itemId: string,
  status: 'done' | 'archived' | 'deleted',
): Promise<DbItem | null> {
  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'done') patch.completed_at = new Date().toISOString();

  if (!hasSupabase()) {
    const item = memoryStore.find((i) => i.id === itemId && i.user_id === userId);
    if (!item) return null;
    Object.assign(item, patch);
    return item;
  }

  const { data, error } = await getSupabase()
    .from('items')
    .update(patch)
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as DbItem;
}

export async function moveInboxToType(
  userId: string,
  itemId: string,
  type: ItemType,
): Promise<DbItem | null> {
  if (!hasSupabase()) {
    const item = memoryStore.find((i) => i.id === itemId && i.user_id === userId);
    if (!item) return null;
    item.type = type;
    item.updated_at = new Date().toISOString();
    return item;
  }

  const { data, error } = await getSupabase()
    .from('items')
    .update({ type, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as DbItem;
}

export function clearMemoryStore(): void {
  memoryStore.length = 0;
}
