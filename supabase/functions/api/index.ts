import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ALLOWED_ID = Number(Deno.env.get('ALLOWED_TELEGRAM_USER_ID'));

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '') || url.pathname;
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: user } = await db
    .from('users')
    .select('id, timezone')
    .eq('telegram_user_id', ALLOWED_ID)
    .single();

  if (!user) {
    return new Response(JSON.stringify({ error: 'user not found' }), { status: 404 });
  }

  if (path === '/dashboard' || path.endsWith('/dashboard')) {
    const { count } = await db
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'inbox')
      .eq('status', 'active');

    const { data: tasks } = await db
      .from('items')
      .select('id, content')
      .eq('user_id', user.id)
      .eq('type', 'task')
      .eq('status', 'active')
      .limit(5);

    const { data: reminders } = await db
      .from('reminders')
      .select('id, title, remind_at')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .order('remind_at')
      .limit(5);

    return Response.json({
      inboxCount: count ?? 0,
      todayTasks: tasks ?? [],
      upcomingReminders: reminders ?? [],
    });
  }

  if (path.startsWith('/items')) {
    const type = url.searchParams.get('type') ?? 'task';
    const { data } = await db
      .from('items')
      .select('id, content, url')
      .eq('user_id', user.id)
      .eq('type', type)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);
    return Response.json(data ?? []);
  }

  if (path.startsWith('/search')) {
    const q = url.searchParams.get('q') ?? '';
    const { data } = await db
      .from('items')
      .select('id, content, type')
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .or(`content.ilike.%${q}%,title.ilike.%${q}%`)
      .limit(10);
    return Response.json(data ?? []);
  }

  return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
});
