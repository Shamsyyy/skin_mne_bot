import { z } from 'zod';
import { ITEM_TYPES, ITEM_STATUSES } from '../constants/item-types.js';

export const ItemTypeSchema = z.enum(ITEM_TYPES);
export const ItemStatusSchema = z.enum(ITEM_STATUSES);

export const CreateItemSchema = z.object({
  type: ItemTypeSchema,
  title: z.string().optional(),
  content: z.string().min(1),
  url: z.string().url().optional().or(z.literal('')),
  source: z.enum(['telegram', 'mini_app', 'ai', 'import']).default('telegram'),
});

export const ItemSchema = CreateItemSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: ItemStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable().optional(),
});

export type CreateItemInput = z.infer<typeof CreateItemSchema>;
export type Item = z.infer<typeof ItemSchema>;
