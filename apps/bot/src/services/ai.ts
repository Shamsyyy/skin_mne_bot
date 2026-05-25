import OpenAI from 'openai';
import { AiIntentSchema, AI_CONFIDENCE_THRESHOLD, type AiIntent } from '@skin-mne/shared';
import { getEnv, hasOpenAI } from '../config.js';
import { logger } from '../utils/logger.js';

export function isAiEnabled(): boolean {
  return hasOpenAI();
}

export async function classifyText(text: string): Promise<AiIntent | null> {
  if (!hasOpenAI()) return null;

  const client = new OpenAI({ apiKey: getEnv().OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: getEnv().OPENAI_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Ты классификатор для личного бота «Скинь мне». Верни JSON:
{ intent, itemType?, title?, content?, url?, reminderText?, remindAt?, expenseAmount?, expenseCategory?, objectName?, locationText?, confidence, clarificationNeeded }
intent: create_item|create_reminder|create_expense|save_location|search|unknown
confidence 0-1. clarificationNeeded true если не уверен.`,
      },
      { role: 'user', content: text },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) return null;

  try {
    const parsed = AiIntentSchema.parse(JSON.parse(raw));
    if (parsed.confidence < AI_CONFIDENCE_THRESHOLD) {
      parsed.clarificationNeeded = true;
    }
    return parsed;
  } catch (e) {
    logger.error('AI parse failed', e);
    return null;
  }
}

export async function transcribeVoice(filePath: string): Promise<string | null> {
  if (!hasOpenAI()) return null;

  const client = new OpenAI({ apiKey: getEnv().OPENAI_API_KEY });
  const { createReadStream } = await import('node:fs');
  const transcription = await client.audio.transcriptions.create({
    file: createReadStream(filePath),
    model: 'whisper-1',
    language: 'ru',
  });
  return transcription.text;
}
