-- Allow anon to update anamnese (for patient signature via PatientDashboard)
DROP POLICY IF EXISTS "anon_update_anamnese" ON public.anamnese;
CREATE POLICY "anon_update_anamnese" ON public.anamnese
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon to select anamnese_templates (so patient sees the correct name of the anamnese in the dashboard)
DROP POLICY IF EXISTS "anon_select_anamnese_templates" ON public.anamnese_templates;
CREATE POLICY "anon_select_anamnese_templates" ON public.anamnese_templates
  FOR SELECT TO anon USING (true);
