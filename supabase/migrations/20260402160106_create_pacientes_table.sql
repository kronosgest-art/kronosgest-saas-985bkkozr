CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE,
    email TEXT UNIQUE,
    telefone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_pacientes" ON public.pacientes;
CREATE POLICY "authenticated_all_pacientes" ON public.pacientes 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
