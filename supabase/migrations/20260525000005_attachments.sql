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
