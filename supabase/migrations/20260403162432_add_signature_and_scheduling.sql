DO $$
BEGIN
  ALTER TABLE public.anamnese ADD COLUMN IF NOT EXISTS assinatura_paciente JSONB;
END $$;

CREATE TABLE IF NOT EXISTS public.tcle_assinado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
    assinatura TEXT NOT NULL,
    data_assinatura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo_assinatura TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    tipo_consulta TEXT NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tcle_assinado ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_tcle_assinado" ON public.tcle_assinado;
CREATE POLICY "authenticated_all_tcle_assinado" ON public.tcle_assinado FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_agendamentos" ON public.agendamentos;
CREATE POLICY "authenticated_all_agendamentos" ON public.agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
