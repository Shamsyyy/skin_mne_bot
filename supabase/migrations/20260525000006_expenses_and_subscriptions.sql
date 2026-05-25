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
