-- Add missing columns to pacientes
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo';
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS last_consultation TIMESTAMPTZ;

-- Migrate data from patients to pacientes safely
DO $block$
BEGIN
  INSERT INTO public.pacientes (id, user_id, nome_completo, cpf, status, last_consultation, created_at, updated_at)
  SELECT id, user_id, name, cpf, status, last_consultation, created_at, updated_at
  FROM public.patients
  ON CONFLICT (id) DO NOTHING;
END $block$;

-- Drop foreign keys referencing patients
ALTER TABLE public.anamnese DROP CONSTRAINT IF EXISTS anamnese_patient_id_fkey;
ALTER TABLE public.exames DROP CONSTRAINT IF EXISTS exames_patient_id_fkey;
ALTER TABLE public.prescricoes DROP CONSTRAINT IF EXISTS prescricoes_patient_id_fkey;

-- Recreate foreign keys referencing pacientes
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'anamnese_patient_id_fkey' AND conrelid = 'public.anamnese'::regclass
  ) THEN
    ALTER TABLE public.anamnese ADD CONSTRAINT anamnese_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exames_patient_id_fkey' AND conrelid = 'public.exames'::regclass
  ) THEN
    ALTER TABLE public.exames ADD CONSTRAINT exames_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'prescricoes_patient_id_fkey' AND conrelid = 'public.prescricoes'::regclass
  ) THEN
    ALTER TABLE public.prescricoes ADD CONSTRAINT prescricoes_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
  END IF;
END $block$;
