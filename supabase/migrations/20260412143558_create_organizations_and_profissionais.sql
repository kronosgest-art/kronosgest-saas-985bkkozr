-- create organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cnpj TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    horario_funcionamento TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- create profissionais
CREATE TABLE IF NOT EXISTS profissionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    cpf TEXT,
    tipo_registro TEXT,
    numero_registro TEXT,
    especialidade TEXT,
    foto_url TEXT,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fix RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_org" ON organizations;
CREATE POLICY "authenticated_select_org" ON organizations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_org" ON organizations;
CREATE POLICY "authenticated_insert_org" ON organizations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_org" ON organizations;
CREATE POLICY "authenticated_update_org" ON organizations FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_prof" ON profissionais;
CREATE POLICY "authenticated_select_prof" ON profissionais FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_prof" ON profissionais;
CREATE POLICY "authenticated_insert_prof" ON profissionais FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_prof" ON profissionais;
CREATE POLICY "authenticated_update_prof" ON profissionais FOR UPDATE TO authenticated USING (true);

DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) VALUES ('organizations', 'organizations', true) ON CONFLICT (id) DO NOTHING;
    INSERT INTO storage.buckets (id, name, public) VALUES ('profissionais', 'profissionais', true) ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Public Access Orgs" ON storage.objects;
CREATE POLICY "Public Access Orgs" ON storage.objects FOR SELECT USING (bucket_id = 'organizations');

DROP POLICY IF EXISTS "Auth Insert Orgs" ON storage.objects;
CREATE POLICY "Auth Insert Orgs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'organizations');

DROP POLICY IF EXISTS "Auth Update Orgs" ON storage.objects;
CREATE POLICY "Auth Update Orgs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'organizations');

DROP POLICY IF EXISTS "Public Access Profs" ON storage.objects;
CREATE POLICY "Public Access Profs" ON storage.objects FOR SELECT USING (bucket_id = 'profissionais');

DROP POLICY IF EXISTS "Auth Insert Profs" ON storage.objects;
CREATE POLICY "Auth Insert Profs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profissionais');

DROP POLICY IF EXISTS "Auth Update Profs" ON storage.objects;
CREATE POLICY "Auth Update Profs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profissionais');
