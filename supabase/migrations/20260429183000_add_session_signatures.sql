DO $$
BEGIN
  ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS assinatura_paciente text;
  ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS data_assinatura timestamptz;
END $$;
