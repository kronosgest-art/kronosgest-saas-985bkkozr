CREATE TABLE IF NOT EXISTS public.receitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_receita TEXT NOT NULL,
    protocolo_id UUID REFERENCES public.protocolos(id) ON DELETE SET NULL,
    descricao_customizada TEXT,
    valor NUMERIC(12,2) NOT NULL,
    data_receita DATE NOT NULL,
    forma_pagamento TEXT NOT NULL,
    recorrente BOOLEAN NOT NULL DEFAULT false,
    frequencia_recorrencia TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS forma_pagamento TEXT NOT NULL DEFAULT 'Pix';
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS tipo_conta TEXT NOT NULL DEFAULT 'Conta Empresa';
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS banco TEXT;

ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "receitas_select" ON public.receitas;
CREATE POLICY "receitas_select" ON public.receitas FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "receitas_insert" ON public.receitas;
CREATE POLICY "receitas_insert" ON public.receitas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "receitas_update" ON public.receitas;
CREATE POLICY "receitas_update" ON public.receitas FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "receitas_delete" ON public.receitas;
CREATE POLICY "receitas_delete" ON public.receitas FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "despesas_user_isolation" ON public.despesas;
DROP POLICY IF EXISTS "despesas_select" ON public.despesas;
CREATE POLICY "despesas_select" ON public.despesas FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "despesas_insert" ON public.despesas;
CREATE POLICY "despesas_insert" ON public.despesas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "despesas_update" ON public.despesas;
CREATE POLICY "despesas_update" ON public.despesas FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "despesas_delete" ON public.despesas;
CREATE POLICY "despesas_delete" ON public.despesas FOR DELETE TO authenticated USING (user_id = auth.uid());
