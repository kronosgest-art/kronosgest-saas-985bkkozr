-- Make sure the unique constraint exists to avoid duplicate subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_key'
  ) THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create trigger function for automatic trial
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  -- We don't want to create subscriptions for patients
  IF NEW.raw_user_meta_data->>'role' = 'paciente' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.subscriptions (user_id, trial_start_date, trial_end_date, status)
  VALUES (
    NEW.id,
    NOW(),
    NOW() + INTERVAL '7 days',
    'trial'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Backfill existing profissionais that don't have a subscription
INSERT INTO public.subscriptions (user_id, trial_start_date, trial_end_date, status)
SELECT id, NOW(), NOW() + INTERVAL '7 days', 'trial'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
AND (raw_user_meta_data->>'role' IS NULL OR raw_user_meta_data->>'role' != 'paciente')
ON CONFLICT (user_id) DO NOTHING;

-- Grant permissions to read/update own subscription (RLS policies fix if any)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Ensure RPCs exist
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
