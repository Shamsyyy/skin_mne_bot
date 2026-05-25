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
