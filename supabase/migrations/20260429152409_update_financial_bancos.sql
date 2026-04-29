ALTER TABLE public.receitas ADD COLUMN IF NOT EXISTS banco_recebimento TEXT;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'despesas' AND column_name = 'banco') THEN
    ALTER TABLE public.despesas RENAME COLUMN banco TO banco_retirada;
  END IF;
END $$;
