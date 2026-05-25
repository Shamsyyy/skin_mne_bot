import type { Bot } from 'grammy';
import type { BotContext } from '../types/context.js';
import { attachmentCategoryKeyboard } from '../keyboards/inline.js';
import type { AttachmentCategory } from '@skin-mne/shared';

export function registerFiles(bot: Bot<BotContext>): void {
  const fileHandler = async (ctx: BotContext) => {
    const msg = ctx.message;
    const fileId =
      msg?.photo?.[msg.photo.length - 1]?.file_id ??
      msg?.document?.file_id;

    if (!fileId) return;

    ctx.session.pendingFileId = fileId;
    ctx.session.flow = 'file_category';

    await ctx.reply(
      '⚠️ Не загружайте пароли, банковские данные, паспорт, СНИЛС и другие критически важные документы.\n\nВыбери категорию:',
      { reply_markup: attachmentCategoryKeyboard() },
    );
  };

  bot.on('message:photo', fileHandler);
  bot.on('message:document', fileHandler);

  bot.callbackQuery(/^att:(.+)$/, async (ctx) => {
    const category = ctx.match[1] as AttachmentCategory;
    const fileId = ctx.session.pendingFileId;
    if (!fileId) {
      await ctx.answerCallbackQuery();
      return;
    }

    // Full storage upload requires Supabase — placeholder confirmation
    ctx.session.flow = undefined;
    ctx.session.pendingFileId = undefined;

    await ctx.editMessageText(
      `Сохранил как ${category}. (Загрузка в Storage — после настройки Supabase) 🧾`,
    );
    await ctx.answerCallbackQuery();
  });
}
