DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'transacoes_financeiras' 
      AND column_name = 'agendamento_id'
  ) THEN
    ALTER TABLE public.transacoes_financeiras ADD COLUMN agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE;
  END IF;
END $$;
