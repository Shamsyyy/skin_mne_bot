import { z } from 'zod';
import { ITEM_TYPES } from '../constants/item-types.js';

export const AiIntentSchema = z.object({
  intent: z.enum([
    'create_item',
    'create_reminder',
    'create_expense',
    'save_location',
    'search',
    'unknown',
  ]),
  itemType: z.enum(ITEM_TYPES).optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  url: z.string().optional(),
  reminderText: z.string().optional(),
  remindAt: z.string().optional(),
  expenseAmount: z.number().optional(),
  expenseCategory: z.string().optional(),
  objectName: z.string().optional(),
  locationText: z.string().optional(),
  confidence: z.number().min(0).max(1),
  clarificationNeeded: z.boolean(),
});

export type AiIntent = z.infer<typeof AiIntentSchema>;

export const AI_CONFIDENCE_THRESHOLD = 0.75;
