-- Add new columns
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.profissionais 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS tipo_profissional TEXT DEFAULT 'proprietario',
ADD COLUMN IF NOT EXISTS pode_ver_financeiro_clinica BOOLEAN DEFAULT false;

ALTER TABLE public.receitas
ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE;

ALTER TABLE public.despesas
ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE;

-- Set profissional_id based on user_id for receitas and despesas
CREATE OR REPLACE FUNCTION public.set_profissional_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profissional_id IS NULL THEN
    NEW.profissional_id := (SELECT id FROM public.profissionais WHERE user_id = NEW.user_id LIMIT 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_receitas_profissional_id ON public.receitas;
CREATE TRIGGER set_receitas_profissional_id
BEFORE INSERT ON public.receitas
FOR EACH ROW EXECUTE FUNCTION public.set_profissional_id();

DROP TRIGGER IF EXISTS set_despesas_profissional_id ON public.despesas;
CREATE TRIGGER set_despesas_profissional_id
BEFORE INSERT ON public.despesas
FOR EACH ROW EXECUTE FUNCTION public.set_profissional_id();

-- RLS Polices to isolate Profissional Cadastrado vs Proprietário

-- Pacientes
DROP POLICY IF EXISTS "pacientes_user_isolation" ON public.pacientes;
CREATE POLICY "pacientes_user_isolation" ON public.pacientes
FOR ALL TO authenticated
USING (
  (user_id = auth.uid()) OR
  (organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))
)
WITH CHECK (
  (user_id = auth.uid()) OR
  (organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))
);

-- Agendamentos
DROP POLICY IF EXISTS "agendamentos_user_isolation" ON public.agendamentos;
CREATE POLICY "agendamentos_user_isolation" ON public.agendamentos
FOR ALL TO authenticated
USING (
  (profissional_id IN (SELECT id FROM public.profissionais WHERE user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.pacientes p WHERE p.id = agendamentos.patient_id AND (p.user_id = auth.uid() OR p.organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))))
)
WITH CHECK (
  (profissional_id IN (SELECT id FROM public.profissionais WHERE user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.pacientes p WHERE p.id = agendamentos.patient_id AND (p.user_id = auth.uid() OR p.organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))))
);

-- Prescrições
DROP POLICY IF EXISTS "prescricoes_user_isolation" ON public.prescricoes;
CREATE POLICY "prescricoes_user_isolation" ON public.prescricoes
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pacientes p 
    WHERE p.id = prescricoes.patient_id 
    AND (p.user_id = auth.uid() OR p.organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pacientes p 
    WHERE p.id = prescricoes.patient_id 
    AND (p.user_id = auth.uid() OR p.organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))
  )
);

-- Receitas
DROP POLICY IF EXISTS "receitas_select" ON public.receitas;
CREATE POLICY "receitas_select" ON public.receitas
FOR SELECT TO authenticated
USING (
  (user_id = auth.uid()) OR
  (profissional_id IN (SELECT id FROM public.profissionais WHERE user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.profissionais p JOIN public.organizations o ON p.organization_id = o.id WHERE p.id = receitas.profissional_id AND o.owner_id = auth.uid()))
);

-- Despesas
DROP POLICY IF EXISTS "despesas_select" ON public.despesas;
CREATE POLICY "despesas_select" ON public.despesas
FOR SELECT TO authenticated
USING (
  (user_id = auth.uid()) OR
  (profissional_id IN (SELECT id FROM public.profissionais WHERE user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.profissionais p JOIN public.organizations o ON p.organization_id = o.id WHERE p.id = despesas.profissional_id AND o.owner_id = auth.uid()))
);
