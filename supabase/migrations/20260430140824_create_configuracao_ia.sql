CREATE TABLE IF NOT EXISTS public.configuracao_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_personalizado TEXT,
  protocolos_selecionados JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.configuracao_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracao_ia_select" ON public.configuracao_ia;
CREATE POLICY "configuracao_ia_select" ON public.configuracao_ia
  FOR SELECT TO authenticated USING (profissional_id = auth.uid());

DROP POLICY IF EXISTS "configuracao_ia_insert" ON public.configuracao_ia;
CREATE POLICY "configuracao_ia_insert" ON public.configuracao_ia
  FOR INSERT TO authenticated WITH CHECK (profissional_id = auth.uid());

DROP POLICY IF EXISTS "configuracao_ia_update" ON public.configuracao_ia;
CREATE POLICY "configuracao_ia_update" ON public.configuracao_ia
  FOR UPDATE TO authenticated USING (profissional_id = auth.uid()) WITH CHECK (profissional_id = auth.uid());

DROP POLICY IF EXISTS "configuracao_ia_delete" ON public.configuracao_ia;
CREATE POLICY "configuracao_ia_delete" ON public.configuracao_ia
  FOR DELETE TO authenticated USING (profissional_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_config_ia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_config_ia_updated_at_trigger ON public.configuracao_ia;
CREATE TRIGGER update_config_ia_updated_at_trigger
  BEFORE UPDATE ON public.configuracao_ia
  FOR EACH ROW EXECUTE FUNCTION public.update_config_ia_updated_at();
