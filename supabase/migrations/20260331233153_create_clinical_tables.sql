DO $BODY$
BEGIN

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cpf TEXT,
    status TEXT DEFAULT 'ativo',
    last_consultation TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL,
    resultado_json JSONB,
    arquivo_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescricoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    anamnese_id TEXT,
    exames_ids UUID[],
    conteudo_json JSONB,
    arquivo_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

END $BODY$;

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescricoes ENABLE ROW LEVEL SECURITY;

-- Add Policies idempotently
DO $BODY$
BEGIN
    DROP POLICY IF EXISTS "authenticated_all_patients" ON public.patients;
    CREATE POLICY "authenticated_all_patients" ON public.patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "authenticated_all_exames" ON public.exames;
    CREATE POLICY "authenticated_all_exames" ON public.exames FOR ALL TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "authenticated_all_prescricoes" ON public.prescricoes;
    CREATE POLICY "authenticated_all_prescricoes" ON public.prescricoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $BODY$;
