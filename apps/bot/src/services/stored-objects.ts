import { getSupabase, hasSupabase } from './supabase.js';

export interface DbStoredObject {
  id: string;
  user_id: string;
  object_name: string;
  location_text: string;
  notes: string | null;
}

const memoryObjects: DbStoredObject[] = [];

export async function saveLocation(
  userId: string,
  objectName: string,
  locationText: string,
  notes?: string,
): Promise<DbStoredObject> {
  const row = { user_id: userId, object_name: objectName, location_text: locationText, notes: notes ?? null };

  if (!hasSupabase()) {
    const o: DbStoredObject = { id: crypto.randomUUID(), ...row };
    memoryObjects.push(o);
    return o;
  }

  const { data, error } = await getSupabase().from('stored_objects').insert(row).select().single();
  if (error) throw error;
  return data as DbStoredObject;
}

export async function findObject(userId: string, query: string): Promise<DbStoredObject[]> {
  const q = query.toLowerCase();
  if (!hasSupabase()) {
    return memoryObjects.filter(
      (o) => o.user_id === userId && o.object_name.toLowerCase().includes(q),
    );
  }
  const { data } = await getSupabase()
    .from('stored_objects')
    .select('*')
    .eq('user_id', userId)
    .ilike('object_name', `%${q}%`);
  return (data ?? []) as DbStoredObject[];
}
