DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo_id UUID REFERENCES public.protocolos(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    valor NUMERIC NOT NULL,
    data_venda TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.transacoes_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID REFERENCES public.vendas(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    protocolo_id UUID REFERENCES public.protocolos(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL DEFAULT 'receita',
    categoria TEXT NOT NULL DEFAULT 'protocolo',
    valor NUMERIC NOT NULL,
    data_transacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pendente',
    descricao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Drop existing policies first to be idempotent
  DROP POLICY IF EXISTS "vendas_user_isolation" ON public.vendas;
  DROP POLICY IF EXISTS "transacoes_user_isolation" ON public.transacoes_financeiras;

  -- RLS vendas
  ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "vendas_user_isolation" ON public.vendas
    FOR ALL TO authenticated
    USING (profissional_id = auth.uid() OR EXISTS (SELECT 1 FROM public.pacientes WHERE pacientes.id = vendas.patient_id AND pacientes.user_id = auth.uid()))
    WITH CHECK (profissional_id = auth.uid() OR EXISTS (SELECT 1 FROM public.pacientes WHERE pacientes.id = vendas.patient_id AND pacientes.user_id = auth.uid()));

  -- RLS transacoes_financeiras
  ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "transacoes_user_isolation" ON public.transacoes_financeiras
    FOR ALL TO authenticated
    USING (profissional_id = auth.uid() OR EXISTS (SELECT 1 FROM public.pacientes WHERE pacientes.id = transacoes_financeiras.patient_id AND pacientes.user_id = auth.uid()))
    WITH CHECK (profissional_id = auth.uid() OR EXISTS (SELECT 1 FROM public.pacientes WHERE pacientes.id = transacoes_financeiras.patient_id AND pacientes.user_id = auth.uid()));

END $$;
