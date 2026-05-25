import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { registerStart } from './start.js';
import { registerRecord, handleRecordText } from './record.js';
import { registerInbox, saveToInbox } from './inbox.js';
import { registerCategories } from './categories.js';
import { registerSearch, handleSearchText } from './search.js';
import { registerItemActions } from './item-actions.js';
import { registerReminders, handleReminderText } from './reminders.js';
import { handleLinkMessage } from './links.js';
import { registerAi, tryAiClassify } from './ai.js';
import { registerVoice } from './voice.js';
import { registerExpenses, tryParseExpense } from './expenses.js';
import { registerLocations, handleLocationText } from './locations.js';
import { registerChecklists } from './checklists.js';
import { registerMiniApp } from './mini-app.js';
import { registerFiles } from './files.js';
import { hasUrl } from '../utils/url.js';
import {
  BTN_RECORD,
  BTN_INBOX,
  BTN_TASKS,
  BTN_PURCHASES,
  BTN_LINKS,
  BTN_NOTES,
  BTN_SEARCH,
  BTN_REMINDERS,
  BTN_UPCOMING,
  BTN_EXPENSES,
  BTN_LOCATIONS,
  BTN_CHECKLISTS,
  BTN_MINI_APP,
} from '../keyboards/main.js';

const MENU_BUTTONS = new Set([
  BTN_RECORD,
  BTN_INBOX,
  BTN_TASKS,
  BTN_PURCHASES,
  BTN_LINKS,
  BTN_NOTES,
  BTN_SEARCH,
  BTN_REMINDERS,
  BTN_UPCOMING,
  BTN_EXPENSES,
  BTN_LOCATIONS,
  BTN_CHECKLISTS,
  BTN_MINI_APP,
]);

export function registerHandlers(bot: Bot<BotContext>): void {
  registerStart(bot);
  registerRecord(bot);
  registerInbox(bot);
  registerCategories(bot);
  registerSearch(bot);
  registerItemActions(bot);
  registerReminders(bot);
  registerAi(bot);
  registerVoice(bot);
  registerExpenses(bot);
  registerLocations(bot);
  registerChecklists(bot);
  registerMiniApp(bot);
  registerFiles(bot);

  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text.trim();
    if (MENU_BUTTONS.has(text)) return;

    if (await handleRecordText(ctx, text)) return;
    if (await handleReminderText(ctx, text)) return;
    if (await handleSearchText(ctx, text)) return;
    if (await tryParseExpense(ctx, text)) return;
    if (await handleLocationText(ctx, text)) return;
    if (await handleLinkMessage(ctx, text)) return;
    if (await tryAiClassify(ctx, text)) return;

    if (hasUrl(text)) return;

    await saveToInbox(ctx, text);
  });
}
