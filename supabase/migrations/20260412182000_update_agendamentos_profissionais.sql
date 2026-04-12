DO $$
BEGIN
  -- Add google_calendar_id to profissionais
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profissionais' AND column_name='google_calendar_id') THEN
    ALTER TABLE public.profissionais ADD COLUMN google_calendar_id TEXT;
  END IF;

  -- Add profissional_id to agendamentos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agendamentos' AND column_name='profissional_id') THEN
    ALTER TABLE public.agendamentos ADD COLUMN profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE;
  END IF;

  -- Add status to agendamentos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agendamentos' AND column_name='status') THEN
    ALTER TABLE public.agendamentos ADD COLUMN status TEXT DEFAULT 'Agendado';
  END IF;

  -- Add google_event_id to agendamentos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agendamentos' AND column_name='google_event_id') THEN
    ALTER TABLE public.agendamentos ADD COLUMN google_event_id TEXT;
  END IF;
END $$;
