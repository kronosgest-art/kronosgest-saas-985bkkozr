DO $$
BEGIN
  -- Add columns to exames if they don't exist
  ALTER TABLE public.exames ADD COLUMN IF NOT EXISTS organization_id uuid;
  ALTER TABLE public.exames ADD COLUMN IF NOT EXISTS interpretacao_ia text;
  ALTER TABLE public.exames ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente';
  ALTER TABLE public.exames ADD COLUMN IF NOT EXISTS observacoes_profissional text;
  
  -- Create bucket 'exames'
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('exames', 'exames', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop and recreate policies for storage.objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'exames');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'exames');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'exames');
