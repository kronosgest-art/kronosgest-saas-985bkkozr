ALTER TABLE public.protocolos
ADD COLUMN IF NOT EXISTS valor_sessao_avulsa NUMERIC,
ADD COLUMN IF NOT EXISTS desconto_progressivo TEXT,
ADD COLUMN IF NOT EXISTS beneficios_esperados TEXT,
ADD COLUMN IF NOT EXISTS contraindicacoes TEXT;
