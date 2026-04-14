CREATE OR REPLACE FUNCTION public.get_admin_subscriptions()
RETURNS TABLE (
  subscription_id UUID,
  user_id UUID,
  nome TEXT,
  email TEXT,
  status TEXT,
  trial_end_date TIMESTAMPTZ,
  free_access_end_date TIMESTAMPTZ
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS subscription_id,
    s.user_id,
    COALESCE(p.nome_completo, 'Desconhecido') AS nome,
    u.email::TEXT AS email,
    s.status,
    s.trial_end_date,
    s.free_access_end_date
  FROM public.subscriptions s
  JOIN auth.users u ON s.user_id = u.id
  LEFT JOIN public.profissionais p ON p.user_id = s.user_id
  WHERE s.status IN ('trial', 'blocked', 'suspended', 'free_access');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_update_subscription(
  p_subscription_id UUID,
  p_status TEXT,
  p_free_access_start_date TIMESTAMPTZ DEFAULT NULL,
  p_free_access_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    status = p_status,
    free_access_start_date = COALESCE(p_free_access_start_date, free_access_start_date),
    free_access_end_date = COALESCE(p_free_access_end_date, free_access_end_date),
    updated_at = NOW()
  WHERE id = p_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
