CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.pagamentos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS guest_dados jsonb;

CREATE TABLE IF NOT EXISTS public.dados_nf (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo text NOT NULL,
    cpf_cnpj bytea NOT NULL,
    telefone text,
    email text NOT NULL,
    plano text NOT NULL,
    valor_pagamento numeric NOT NULL,
    data_pagamento timestamptz NOT NULL,
    data_geracao_nf timestamptz,
    numero_nf text,
    status text NOT NULL DEFAULT 'pendente_nf',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.inserir_dados_nf(
  p_user_id uuid,
  p_nome_completo text,
  p_cpf_cnpj text,
  p_telefone text,
  p_email text,
  p_plano text,
  p_valor_pagamento numeric,
  p_data_pagamento timestamptz,
  p_encryption_key text
) RETURNS uuid AS $BODY$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.dados_nf (
    user_id, nome_completo, cpf_cnpj, telefone, email, plano, valor_pagamento, data_pagamento
  ) VALUES (
    p_user_id, p_nome_completo, pgp_sym_encrypt(p_cpf_cnpj, p_encryption_key), p_telefone, p_email, p_plano, p_valor_pagamento, p_data_pagamento
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$BODY$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(p_email text)
RETURNS boolean AS $BODY$
BEGIN
  RETURN EXISTS(SELECT 1 FROM auth.users WHERE email = p_email);
END;
$BODY$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "dados_nf_user_isolation" ON public.dados_nf;
CREATE POLICY "dados_nf_user_isolation" ON public.dados_nf
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

ALTER TABLE public.dados_nf ENABLE ROW LEVEL SECURITY;
