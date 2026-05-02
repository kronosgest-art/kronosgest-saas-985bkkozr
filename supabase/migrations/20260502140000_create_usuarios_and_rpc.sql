CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cpf text,
  telefone text,
  email text,
  criado_via text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_user_isolation" ON public.usuarios;
CREATE POLICY "usuarios_user_isolation" ON public.usuarios
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email text)
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM auth.users WHERE email = p_email LIMIT 1;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION insert_usuario_encrypted(
  p_user_id uuid,
  p_nome text,
  p_cpf text,
  p_telefone text,
  p_email text,
  p_criado_via text,
  p_secret_key text
) RETURNS void AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, nome, cpf, telefone, email, criado_via)
  VALUES (
    p_user_id, 
    p_nome, 
    pgp_sym_encrypt(p_cpf, p_secret_key), 
    p_telefone, 
    p_email, 
    p_criado_via
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
