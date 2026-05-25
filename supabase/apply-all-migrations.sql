-- 20260525000001_extensions_and_helpers.sql

-- Extensions and shared helpers
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- 20260525000002_users.sql

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id bigint NOT NULL UNIQUE,
  first_name text,
  username text,
  timezone text NOT NULL DEFAULT 'Europe/Helsinki',
  is_owner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_telegram_user_id ON public.users (telegram_user_id);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_service_all ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);



-- 20260525000003_items.sql

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('task', 'purchase', 'link', 'note', 'inbox')),
  title text,
  content text NOT NULL,
  url text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'done', 'archived', 'deleted')),
  source text NOT NULL DEFAULT 'telegram'
    CHECK (source IN ('telegram', 'mini_app', 'ai', 'import')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_items_user_status ON public.items (user_id, status);
CREATE INDEX idx_items_user_type_status ON public.items (user_id, type, status);
CREATE INDEX idx_items_created_at ON public.items (user_id, created_at DESC);
CREATE INDEX idx_items_search ON public.items USING gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(url, ''))
);

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY items_service_all ON public.items
  FOR ALL
  USING (true)
  WITH CHECK (true);



-- 20260525000004_reminders.sql

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



-- 20260525000005_attachments.sql

CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN (
    'receipt', 'warranty', 'return', 'instruction', 'screenshot', 'other'
  )),
  storage_path text NOT NULL,
  original_filename text,
  mime_type text,
  size_bytes bigint,
  extracted_text text,
  purchase_date date,
  warranty_until date,
  return_until date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_user_category ON public.attachments (user_id, category);
CREATE INDEX idx_attachments_warranty ON public.attachments (user_id, warranty_until)
  WHERE warranty_until IS NOT NULL;
CREATE INDEX idx_attachments_return ON public.attachments (user_id, return_until)
  WHERE return_until IS NOT NULL;

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY attachments_service_all ON public.attachments
  FOR ALL
  USING (true)
  WITH CHECK (true);



-- 20260525000006_expenses_and_subscriptions.sql

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'RUB',
  category text NOT NULL,
  description text,
  spent_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_user_spent ON public.expenses (user_id, spent_at DESC);
CREATE INDEX idx_expenses_user_category ON public.expenses (user_id, category, spent_at DESC);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'RUB',
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'yearly', 'custom')),
  next_payment_at timestamptz,
  reminder_days_before integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_next ON public.subscriptions (user_id, next_payment_at)
  WHERE status = 'active';

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY expenses_service_all ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY subscriptions_service_all ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);



-- 20260525000007_stored_objects_and_checklists.sql

CREATE TABLE public.stored_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  object_name text NOT NULL,
  location_text text NOT NULL,
  notes text,
  photo_attachment_id uuid REFERENCES public.attachments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stored_objects_user_name ON public.stored_objects (user_id, object_name);
CREATE INDEX idx_stored_objects_location ON public.stored_objects USING gin (
  to_tsvector('simple', location_text)
);

CREATE TRIGGER trg_stored_objects_updated_at
  BEFORE UPDATE ON public.stored_objects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_items_list ON public.checklist_items (checklist_id, sort_order);

ALTER TABLE public.stored_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY stored_objects_service_all ON public.stored_objects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY checklists_service_all ON public.checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY checklist_items_service_all ON public.checklist_items FOR ALL USING (true) WITH CHECK (true);



-- 20260525000008_audit_logs.sql

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_created ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT
  USING (true);



-- 20260525000009_storage_bucket.sql

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files',
  'user-files',
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY storage_user_files_select ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-files');

CREATE POLICY storage_user_files_insert ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'user-files');

CREATE POLICY storage_user_files_delete ON storage.objects
  FOR DELETE
  USING (bucket_id = 'user-files');



