-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admin can insert audit logs" ON public.admin_audit_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admin can read audit logs" ON public.admin_audit_logs FOR SELECT TO authenticated USING (true);

-- Create RPC to get all subscribers
CREATE OR REPLACE FUNCTION public.get_all_subscribers()
RETURNS TABLE (
  subscription_id uuid,
  user_id uuid,
  clinica_nome text,
  email text,
  plan text,
  status text,
  created_at timestamp with time zone,
  trial_end_date timestamp with time zone,
  free_access_end_date timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (s.id)
    s.id AS subscription_id,
    s.user_id,
    COALESCE(o.nome, p.nome_completo, 'Desconhecida') AS clinica_nome,
    u.email::TEXT AS email,
    COALESCE(s.plan, 'Básico') AS plan,
    s.status,
    s.created_at,
    s.trial_end_date,
    s.free_access_end_date
  FROM public.subscriptions s
  JOIN auth.users u ON s.user_id = u.id
  LEFT JOIN public.profissionais p ON p.user_id = s.user_id
  LEFT JOIN public.organizations o ON p.organization_id = o.id OR o.owner_id = u.id;
END;
$function$;

-- Create RPC to update subscription
CREATE OR REPLACE FUNCTION public.admin_update_subscription_full(
  p_subscription_id uuid, 
  p_status text DEFAULT NULL, 
  p_plan text DEFAULT NULL,
  p_blocked_reason text DEFAULT NULL,
  p_add_months integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF p_status IS NOT NULL THEN
    UPDATE public.subscriptions SET status = p_status WHERE id = p_subscription_id;
  END IF;
  
  IF p_plan IS NOT NULL THEN
    UPDATE public.subscriptions SET plan = p_plan WHERE id = p_subscription_id;
  END IF;

  IF p_blocked_reason IS NOT NULL THEN
    UPDATE public.subscriptions SET blocked_reason = p_blocked_reason WHERE id = p_subscription_id;
  END IF;

  IF p_add_months > 0 THEN
    UPDATE public.subscriptions 
    SET 
      free_access_end_date = COALESCE(free_access_end_date, trial_end_date, NOW()) + (p_add_months || ' months')::interval,
      status = CASE WHEN status IN ('blocked', 'suspended') THEN 'free_access' ELSE status END
    WHERE id = p_subscription_id;
  END IF;
END;
$function$;
