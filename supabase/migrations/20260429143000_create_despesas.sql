DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendas' AND column_name = 'tipo') THEN
    ALTER TABLE public.vendas ADD COLUMN tipo TEXT DEFAULT 'entrada';
  END IF;
  UPDATE public.vendas SET tipo = 'entrada' WHERE tipo IS NULL;
END $block$;

CREATE TABLE IF NOT EXISTS public.despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    data_despesa DATE NOT NULL,
    recorrente BOOLEAN NOT NULL DEFAULT false,
    frequencia_recorrencia TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "despesas_user_isolation" ON public.despesas;
CREATE POLICY "despesas_user_isolation" ON public.despesas
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
