-- Pacientes
DROP POLICY IF EXISTS "authenticated_all_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_user_isolation" ON public.pacientes;
CREATE POLICY "pacientes_user_isolation" ON public.pacientes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Patients (legacy)
DROP POLICY IF EXISTS "authenticated_all_patients" ON public.patients;
DROP POLICY IF EXISTS "patients_user_isolation" ON public.patients;
CREATE POLICY "patients_user_isolation" ON public.patients
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Agendamentos
DROP POLICY IF EXISTS "authenticated_all_agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_user_isolation" ON public.agendamentos;
CREATE POLICY "agendamentos_user_isolation" ON public.agendamentos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pacientes WHERE id = agendamentos.patient_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pacientes WHERE id = agendamentos.patient_id AND user_id = auth.uid()));

-- Anamnese
DROP POLICY IF EXISTS "authenticated_all_anamnese" ON public.anamnese;
DROP POLICY IF EXISTS "anamnese_user_isolation" ON public.anamnese;
CREATE POLICY "anamnese_user_isolation" ON public.anamnese
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pacientes WHERE id = anamnese.patient_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pacientes WHERE id = anamnese.patient_id AND user_id = auth.uid()));

-- Exames
DROP POLICY IF EXISTS "authenticated_all_exames" ON public.exames;
DROP POLICY IF EXISTS "exames_user_isolation" ON public.exames;
CREATE POLICY "exames_user_isolation" ON public.exames
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pacientes WHERE id = exames.patient_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pacientes WHERE id = exames.patient_id AND user_id = auth.uid()));

-- Prescricoes
DROP POLICY IF EXISTS "authenticated_all_prescricoes" ON public.prescricoes;
DROP POLICY IF EXISTS "prescricoes_user_isolation" ON public.prescricoes;
CREATE POLICY "prescricoes_user_isolation" ON public.prescricoes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pacientes WHERE id = prescricoes.patient_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pacientes WHERE id = prescricoes.patient_id AND user_id = auth.uid()));

-- TCLE Assinado
DROP POLICY IF EXISTS "authenticated_all_tcle_assinado" ON public.tcle_assinado;
DROP POLICY IF EXISTS "tcle_assinado_user_isolation" ON public.tcle_assinado;
CREATE POLICY "tcle_assinado_user_isolation" ON public.tcle_assinado
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pacientes WHERE id = tcle_assinado.patient_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pacientes WHERE id = tcle_assinado.patient_id AND user_id = auth.uid()));
