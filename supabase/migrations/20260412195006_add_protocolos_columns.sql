ALTER TABLE public.protocolos
ADD COLUMN IF NOT EXISTS nome_protocolo TEXT,
ADD COLUMN IF NOT EXISTS indicacao TEXT,
ADD COLUMN IF NOT EXISTS numero_sessoes INTEGER,
ADD COLUMN IF NOT EXISTS tipo_aplicacao TEXT,
ADD COLUMN IF NOT EXISTS frequencia TEXT,
ADD COLUMN IF NOT EXISTS duracao_sessao TEXT,
ADD COLUMN IF NOT EXISTS valor_total NUMERIC,
ADD COLUMN IF NOT EXISTS tipo_tcle TEXT,
ADD COLUMN IF NOT EXISTS tcle_outro TEXT,
ADD COLUMN IF NOT EXISTS beneficios_esperados TEXT,
ADD COLUMN IF NOT EXISTS apenas_pacote_fechado BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "protocolos_user_isolation" ON public.protocolos;
CREATE POLICY "protocolos_user_isolation" ON public.protocolos
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR criado_por = auth.uid() OR is_padrao = true)
  WITH CHECK (user_id = auth.uid() OR criado_por = auth.uid() OR is_padrao = true);
