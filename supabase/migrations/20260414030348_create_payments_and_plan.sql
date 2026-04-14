ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'Básico';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'succeeded',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read payments" ON public.payments;
CREATE POLICY "Admin can read payments" ON public.payments 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin can insert payments" ON public.payments;
CREATE POLICY "Admin can insert payments" ON public.payments 
  FOR INSERT TO authenticated WITH CHECK (true);

DO $$
DECLARE
  v_user record;
  v_sub_id uuid;
BEGIN
  -- Definir alguns planos variados para visualizacao inicial se todos forem basicos ou nulos
  UPDATE public.subscriptions SET plan = 'Premium' WHERE status = 'active' AND plan IS DISTINCT FROM 'Premium' AND random() > 0.8;
  UPDATE public.subscriptions SET plan = 'Profissional' WHERE status = 'active' AND plan IS DISTINCT FROM 'Profissional' AND random() > 0.6;
  UPDATE public.subscriptions SET plan = 'Básico' WHERE plan IS NULL;

  -- Inserir dados de pagamentos para mock caso a tabela esteja vazia
  IF NOT EXISTS (SELECT 1 FROM public.payments) THEN
    FOR v_user IN SELECT id FROM auth.users LIMIT 10 LOOP
      SELECT id INTO v_sub_id FROM public.subscriptions WHERE user_id = v_user.id LIMIT 1;
      IF v_sub_id IS NOT NULL THEN
        INSERT INTO public.payments (subscription_id, user_id, amount, created_at)
        VALUES 
          (v_sub_id, v_user.id, 99.00, NOW()),
          (v_sub_id, v_user.id, 199.00, NOW() - INTERVAL '1 month'),
          (v_sub_id, v_user.id, 299.00, NOW() - INTERVAL '2 months');
      END IF;
    END LOOP;
  END IF;
END $$;
