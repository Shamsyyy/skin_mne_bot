import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const BOT_TOKEN = Deno.env.get('BOT_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async () => {
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: due, error } = await db.rpc('claim_due_reminders', { p_limit: 20 });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  for (const r of due ?? []) {
    const { data: user } = await db
      .from('users')
      .select('telegram_user_id')
      .eq('id', r.user_id)
      .single();

    if (!user) continue;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user.telegram_user_id,
        text: `⏰ ${r.title}`,
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Выполнено', callback_data: `rsent:done:${r.id}` }],
            [
              { text: '⏰ Через 1 час', callback_data: `rsent:1h:${r.id}` },
              { text: '🌅 Завтра', callback_data: `rsent:tm:${r.id}` },
            ],
            [{ text: '❌ Отменить', callback_data: `rsent:cancel:${r.id}` }],
          ],
        },
      }),
    });

    const body = await res.json();
    if (body.ok) {
      await db
        .from('reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          telegram_message_id: body.result.message_id,
        })
        .eq('id', r.id)
        .eq('status', 'processing');
      sent++;
    } else {
      await db
        .from('reminders')
        .update({ status: 'failed', error_message: 'telegram send failed' })
        .eq('id', r.id);
    }
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
