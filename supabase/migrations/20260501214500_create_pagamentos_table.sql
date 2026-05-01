CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plano TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  order_nsu TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente',
  metodo_pagamento TEXT NOT NULL,
  cupom_aplicado TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_user_id ON public.pagamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_order_nsu ON public.pagamentos(order_nsu);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios pagamentos" ON public.pagamentos;
CREATE POLICY "Usuários podem ver seus próprios pagamentos" ON public.pagamentos
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios pagamentos" ON public.pagamentos;
CREATE POLICY "Usuários podem inserir seus próprios pagamentos" ON public.pagamentos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
