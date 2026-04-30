CREATE TABLE IF NOT EXISTS public.etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.abas_crm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  etiqueta_id UUID REFERENCES public.etiquetas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS etiqueta_id UUID REFERENCES public.etiquetas(id) ON DELETE SET NULL;

ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abas_crm ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "etiquetas_user_isolation" ON public.etiquetas;
CREATE POLICY "etiquetas_user_isolation" ON public.etiquetas
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "abas_crm_user_isolation" ON public.abas_crm;
CREATE POLICY "abas_crm_user_isolation" ON public.abas_crm
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  FOR v_user_id IN SELECT id FROM auth.users LOOP
    IF NOT EXISTS (SELECT 1 FROM public.etiquetas WHERE user_id = v_user_id) THEN
      INSERT INTO public.etiquetas (user_id, nome, cor) VALUES
        (v_user_id, 'Novo lead', 'bg-blue-100 text-blue-800'),
        (v_user_id, 'Em atendimento', 'bg-yellow-100 text-yellow-800'),
        (v_user_id, 'Agendado', 'bg-green-100 text-green-800'),
        (v_user_id, 'Pendente de pagamento', 'bg-orange-100 text-orange-800'),
        (v_user_id, 'Perdido', 'bg-red-100 text-red-800'),
        (v_user_id, 'Paciente ativo', 'bg-emerald-100 text-emerald-800');
        
      INSERT INTO public.abas_crm (user_id, nome, etiqueta_id) VALUES
        (v_user_id, 'Todos os Leads', NULL);
    END IF;
  END LOOP;
END $$;
