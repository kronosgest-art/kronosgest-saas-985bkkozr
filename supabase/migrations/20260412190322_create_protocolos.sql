CREATE TABLE IF NOT EXISTS public.protocolos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT,
  duracao TEXT,
  descricao TEXT,
  suplementos TEXT,
  contraindicacoes TEXT,
  is_padrao BOOLEAN DEFAULT false,
  vezes_prescrito INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.protocolos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "protocolos_user_isolation" ON public.protocolos;
CREATE POLICY "protocolos_user_isolation" ON public.protocolos
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR is_padrao = true)
  WITH CHECK (user_id = auth.uid() OR is_padrao = true);

-- Inserir alguns protocolos padrão iniciais para evitar empty state
INSERT INTO public.protocolos (nome, tipo, duracao, descricao, suplementos, contraindicacoes, is_padrao, vezes_prescrito)
VALUES 
  ('Limpeza Hepática Profunda', 'Limpeza do Terreno', '14 dias', 'Protocolo para desintoxicação das vias biliares e fígado.', '1. Sal Amargo (Sulfato de Magnésio) - 15g\n2. Azeite de Oliva Extravirgem - 100ml\n3. Suco de Toranja ou Limão - 50ml\n4. Ácido Mólico - 500mg ao dia (preparação)', 'Pedras na vesícula muito grandes sem acompanhamento, úlcera ativa.', true, 12),
  ('Desparasitação Completa', 'Desparasitação', '21 dias', 'Eliminação de parasitas intestinais e sistêmicos.', '1. Tintura de Cravo (10 gotas 2x ao dia)\n2. Tintura de Absinto (10 gotas 2x ao dia)\n3. Tintura de Noz Negra (10 gotas 2x ao dia)\n4. Óleo de Orégano (1 cápsula/dia)', 'Gestantes e lactantes.', true, 25),
  ('Detox Metais Pesados', 'Detox', '30 dias', 'Quelação suave de metais pesados.', '1. Chlorella 500mg - 2 cápsulas 2x/dia\n2. Zeólita Clinoptilolita - 1 colher de chá/dia\n3. Coentro em tintura - 15 gotas/dia', 'Insuficiência renal grave.', true, 8)
ON CONFLICT DO NOTHING;
