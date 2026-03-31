-- Create Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'novo',
  msg TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
CREATE POLICY "Users can insert their own leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at_trigger ON public.leads;
CREATE TRIGGER update_leads_updated_at_trigger
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_leads_updated_at();

-- Seed data for leads
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Ensure seed user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dra.morganavieira@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'dra.morganavieira@gmail.com',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Dra Morgana Vieira"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'dra.morganavieira@gmail.com' LIMIT 1;
  END IF;

  -- Insert mock leads into database for the new user, if they don't exist
  INSERT INTO public.leads (id, user_id, name, status, msg, source) VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, new_user_id, 'Pedro Alves', 'novo', 'Gostaria de saber sobre limpeza hepática.', 'Instagram'),
    ('22222222-2222-2222-2222-222222222222'::uuid, new_user_id, 'Lucia Ferraz', 'contato', 'Qual o valor da consulta?', 'WhatsApp'),
    ('33333333-3333-3333-3333-333333333333'::uuid, new_user_id, 'Roberto Lima', 'agendado', 'Marcado para 15/10', 'Site'),
    ('44444444-4444-4444-4444-444444444444'::uuid, new_user_id, 'Fernanda Luz', 'novo', 'Vocês tratam enxaqueca?', 'Facebook')
  ON CONFLICT (id) DO NOTHING;
END $$;
