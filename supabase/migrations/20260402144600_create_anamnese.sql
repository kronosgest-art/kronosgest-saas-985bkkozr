CREATE TABLE IF NOT EXISTS public.anamnese (
  anamnese_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  organization_id UUID,
  template_id UUID REFERENCES public.anamnese_templates(template_id) ON DELETE SET NULL,
  respostas JSONB NOT NULL DEFAULT '[]'::jsonb,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.anamnese ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_anamnese" ON public.anamnese;
CREATE POLICY "authenticated_all_anamnese" ON public.anamnese
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
