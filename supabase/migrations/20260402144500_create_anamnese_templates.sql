CREATE TABLE IF NOT EXISTS public.anamnese_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  profissional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_template TEXT NOT NULL,
  eh_padrao BOOLEAN DEFAULT false,
  perguntas JSONB NOT NULL DEFAULT '[]'::jsonb,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.anamnese_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own templates" ON public.anamnese_templates;
CREATE POLICY "Users can view their own templates" ON public.anamnese_templates
  FOR SELECT TO authenticated USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.anamnese_templates;
CREATE POLICY "Users can insert their own templates" ON public.anamnese_templates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.anamnese_templates;
CREATE POLICY "Users can update their own templates" ON public.anamnese_templates
  FOR UPDATE TO authenticated USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.anamnese_templates;
CREATE POLICY "Users can delete their own templates" ON public.anamnese_templates
  FOR DELETE TO authenticated USING (auth.uid() = profissional_id);

CREATE OR REPLACE FUNCTION public.handle_new_profissional_template()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.anamnese_templates (profissional_id, nome_template, eh_padrao, perguntas)
  VALUES (
    NEW.id,
    'Padrão Morgana',
    true,
    '[
      {"id": "1", "titulo": "Dados Pessoais", "tipo": "text", "obrigatoria": true},
      {"id": "2", "titulo": "Queixa Principal", "tipo": "text", "obrigatoria": true},
      {"id": "3", "titulo": "Histórico de Saúde", "tipo": "text", "obrigatoria": false},
      {"id": "4", "titulo": "Avaliação por Sistemas", "tipo": "text", "obrigatoria": false},
      {"id": "5", "titulo": "Estilo de Vida", "tipo": "text", "obrigatoria": false},
      {"id": "6", "titulo": "Queixas Estéticas", "tipo": "text", "obrigatoria": false},
      {"id": "7", "titulo": "Observações do Profissional", "tipo": "text", "obrigatoria": false},
      {"id": "8", "titulo": "Tem órgãos amputados? (Biorressonância não identifica órgãos ausentes)", "tipo": "select", "opcoes": ["Sim", "Não"], "obrigatoria": true}
    ]'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_template ON auth.users;
CREATE TRIGGER on_auth_user_created_template
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profissional_template();

DO $$
BEGIN
  INSERT INTO public.anamnese_templates (profissional_id, nome_template, eh_padrao, perguntas)
  SELECT id, 'Padrão Morgana', true, '[
        {"id": "1", "titulo": "Dados Pessoais", "tipo": "text", "obrigatoria": true},
        {"id": "2", "titulo": "Queixa Principal", "tipo": "text", "obrigatoria": true},
        {"id": "3", "titulo": "Histórico de Saúde", "tipo": "text", "obrigatoria": false},
        {"id": "4", "titulo": "Avaliação por Sistemas", "tipo": "text", "obrigatoria": false},
        {"id": "5", "titulo": "Estilo de Vida", "tipo": "text", "obrigatoria": false},
        {"id": "6", "titulo": "Queixas Estéticas", "tipo": "text", "obrigatoria": false},
        {"id": "7", "titulo": "Observações do Profissional", "tipo": "text", "obrigatoria": false},
        {"id": "8", "titulo": "Tem órgãos amputados? (Biorressonância não identifica órgãos ausentes)", "tipo": "select", "opcoes": ["Sim", "Não"], "obrigatoria": true}
      ]'::jsonb
  FROM auth.users
  WHERE NOT EXISTS (
    SELECT 1 FROM public.anamnese_templates WHERE profissional_id = auth.users.id AND eh_padrao = true
  );
END $$;
