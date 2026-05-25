CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  title text NOT NULL,
  remind_at timestamptz NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Helsinki',
  recurrence_rule text,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'processing', 'sent', 'cancelled', 'failed')),
  sent_at timestamptz,
  telegram_message_id bigint,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminders_due ON public.reminders (status, remind_at)
  WHERE status = 'scheduled';
CREATE INDEX idx_reminders_user_upcoming ON public.reminders (user_id, remind_at)
  WHERE status IN ('scheduled', 'processing');

CREATE TRIGGER trg_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY reminders_service_all ON public.reminders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Atomic claim for idempotent dispatch
CREATE OR REPLACE FUNCTION public.claim_due_reminders(p_limit int DEFAULT 10)
RETURNS SETOF public.reminders AS $$
  UPDATE public.reminders r
  SET status = 'processing', updated_at = now()
  WHERE r.id IN (
    SELECT id FROM public.reminders
    WHERE status = 'scheduled' AND remind_at <= now()
    ORDER BY remind_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
$$ LANGUAGE sql;
