CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  credits_amount INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all credit purchases" ON public.credit_purchases;
CREATE POLICY "Admins can view all credit purchases" ON public.credit_purchases
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage all credit purchases" ON public.credit_purchases;
CREATE POLICY "Admins can manage all credit purchases" ON public.credit_purchases
  FOR ALL TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.get_admin_credit_purchases()
RETURNS TABLE(
  id uuid,
  created_at timestamp with time zone,
  clinica_nome text,
  admin_email text,
  package_name text,
  credits_amount integer,
  price numeric,
  status text,
  payment_method text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.created_at,
    COALESCE(o.nome, 'Desconhecida') AS clinica_nome,
    u.email::TEXT AS admin_email,
    cp.package_name,
    cp.credits_amount,
    cp.price,
    cp.status,
    cp.payment_method
  FROM public.credit_purchases cp
  JOIN auth.users u ON cp.user_id = u.id
  LEFT JOIN public.organizations o ON cp.organization_id = o.id
  ORDER BY cp.created_at DESC;
END;
$$;

DO $$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
BEGIN
  SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_org_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    INSERT INTO public.credit_purchases (organization_id, user_id, package_name, credits_amount, price, status, payment_method, created_at)
    VALUES
      (v_org_id, v_user_id, '10 Créditos', 10, 49.90, 'paid', 'pix', NOW() - INTERVAL '2 days'),
      (v_org_id, v_user_id, '50 Créditos', 50, 179.90, 'pending', 'boleto', NOW() - INTERVAL '1 day'),
      (v_org_id, v_user_id, '25 Créditos', 25, 99.90, 'paid', 'card', NOW() - INTERVAL '5 days')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
