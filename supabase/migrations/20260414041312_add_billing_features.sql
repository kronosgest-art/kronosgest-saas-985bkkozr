DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='payments' AND column_name='method') THEN
    ALTER TABLE public.payments ADD COLUMN method TEXT DEFAULT 'Cartão';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_admin_billing()
RETURNS TABLE(
    payment_id uuid,
    created_at timestamp with time zone,
    clinica_nome text,
    email text,
    plan text,
    amount numeric,
    status text,
    method text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS payment_id,
    p.created_at,
    COALESCE(o.nome, prof.nome_completo, 'Desconhecida') AS clinica_nome,
    u.email::TEXT AS email,
    COALESCE(s.plan, 'Básico') AS plan,
    p.amount,
    p.status,
    p.method
  FROM public.payments p
  LEFT JOIN public.subscriptions s ON p.subscription_id = s.id OR p.user_id = s.user_id
  JOIN auth.users u ON p.user_id = u.id
  LEFT JOIN public.profissionais prof ON prof.user_id = p.user_id
  LEFT JOIN public.organizations o ON prof.organization_id = o.id OR o.owner_id = u.id
  ORDER BY p.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_payment_status(p_payment_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.payments SET status = p_status WHERE id = p_payment_id;
END;
$function$;

DO $$
DECLARE
  v_user_id uuid;
  v_sub_id uuid;
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.payments;
  IF v_count = 0 THEN
    SELECT id, user_id INTO v_sub_id, v_user_id FROM public.subscriptions LIMIT 1;
    
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.payments (id, subscription_id, user_id, amount, status, method, created_at)
      VALUES 
        (gen_random_uuid(), v_sub_id, v_user_id, 199.90, 'Pago', 'Cartão', NOW()),
        (gen_random_uuid(), v_sub_id, v_user_id, 299.90, 'Pendente', 'Boleto', NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), v_sub_id, v_user_id, 399.90, 'Falha', 'PIX', NOW() - INTERVAL '2 days')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;
