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
