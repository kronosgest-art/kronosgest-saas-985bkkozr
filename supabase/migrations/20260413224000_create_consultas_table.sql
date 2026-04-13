CREATE TABLE IF NOT EXISTS public.consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    consultation_type TEXT NOT NULL,
    consultation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Realizada',
    data_collected JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultas_user_isolation" ON public.consultas;
CREATE POLICY "consultas_user_isolation" ON public.consultas
    FOR ALL TO authenticated
    USING (EXISTS ( SELECT 1 FROM public.pacientes WHERE ((pacientes.id = consultas.patient_id) AND (pacientes.user_id = auth.uid()))))
    WITH CHECK (EXISTS ( SELECT 1 FROM public.pacientes WHERE ((pacientes.id = consultas.patient_id) AND (pacientes.user_id = auth.uid()))));
