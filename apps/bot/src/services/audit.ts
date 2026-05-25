import { getSupabase, hasSupabase } from './supabase.js';
import { logger } from '../utils/logger.js';

export async function logAudit(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const safeMeta = { ...metadata };
  delete safeMeta.password;
  delete safeMeta.token;

  if (!hasSupabase()) {
    logger.info(`audit:${action}`, { entityType, entityId: entityId?.slice(0, 8) });
    return;
  }

  await getSupabase().from('audit_logs').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: safeMeta,
  });
}
