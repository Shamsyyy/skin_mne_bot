import type { Context, SessionFlavor } from 'grammy';
import type { ItemType } from '@skin-mne/shared';
import type { AiIntent } from '@skin-mne/shared';

export interface SessionData {
  flow?:
    | 'record_text'
    | 'record_category'
    | 'search'
    | 'reminder_text'
    | 'reminder_time'
    | 'link_description'
    | 'ai_confirm'
    | 'expense_amount'
    | 'location_save'
    | 'file_category';
  pendingText?: string;
  pendingUrl?: string;
  pendingItemId?: string;
  pendingAiIntent?: AiIntent;
  pendingCategory?: ItemType;
  pendingReminderId?: string;
  pendingFileId?: string;
}

export type BotContext = Context & SessionFlavor<SessionData>;

export interface DbUser {
  id: string;
  telegram_user_id: number;
  first_name: string | null;
  username: string | null;
  timezone: string;
  is_owner: boolean;
}

export interface DbItem {
  id: string;
  user_id: string;
  type: ItemType;
  title: string | null;
  content: string;
  url: string | null;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface DbReminder {
  id: string;
  user_id: string;
  item_id: string | null;
  title: string;
  remind_at: string;
  timezone: string;
  recurrence_rule: string | null;
  status: string;
  sent_at: string | null;
  telegram_message_id: number | null;
}
