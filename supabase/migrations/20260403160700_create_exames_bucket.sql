DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('exames', 'exames', true) 
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "public_exames_select" ON storage.objects;
CREATE POLICY "public_exames_select" ON storage.objects 
  FOR SELECT TO public USING (bucket_id = 'exames');

DROP POLICY IF EXISTS "authenticated_exames_insert" ON storage.objects;
CREATE POLICY "authenticated_exames_insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'exames');

DROP POLICY IF EXISTS "authenticated_exames_update" ON storage.objects;
CREATE POLICY "authenticated_exames_update" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'exames');

DROP POLICY IF EXISTS "authenticated_exames_delete" ON storage.objects;
CREATE POLICY "authenticated_exames_delete" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'exames');
