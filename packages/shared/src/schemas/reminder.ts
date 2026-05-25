import { z } from 'zod';

export const ReminderStatusSchema = z.enum([
  'scheduled',
  'processing',
  'sent',
  'cancelled',
  'failed',
]);

export const RecurrenceRuleSchema = z.enum(['daily', 'weekly', 'monthly']).nullable();

export const CreateReminderSchema = z.object({
  title: z.string().min(1),
  remind_at: z.string().datetime(),
  item_id: z.string().uuid().optional(),
  recurrence_rule: RecurrenceRuleSchema.optional(),
});

export const ReminderSchema = CreateReminderSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: ReminderStatusSchema,
  timezone: z.string(),
  sent_at: z.string().nullable().optional(),
  telegram_message_id: z.number().nullable().optional(),
});

export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;
export type Reminder = z.infer<typeof ReminderSchema>;
