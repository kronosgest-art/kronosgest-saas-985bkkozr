DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS public.pacientes_acesso (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
        email TEXT NOT NULL UNIQUE,
        cpf TEXT NOT NULL UNIQUE,
        ativo BOOLEAN NOT NULL DEFAULT true,
        criado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE public.pacientes_acesso ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "profissional_select_acesso" ON public.pacientes_acesso;
    CREATE POLICY "profissional_select_acesso" ON public.pacientes_acesso
        FOR SELECT TO authenticated USING (criado_por = auth.uid());

    DROP POLICY IF EXISTS "profissional_insert_acesso" ON public.pacientes_acesso;
    CREATE POLICY "profissional_insert_acesso" ON public.pacientes_acesso
        FOR INSERT TO authenticated WITH CHECK (criado_por = auth.uid());

    DROP POLICY IF EXISTS "profissional_update_acesso" ON public.pacientes_acesso;
    CREATE POLICY "profissional_update_acesso" ON public.pacientes_acesso
        FOR UPDATE TO authenticated USING (criado_por = auth.uid());

    DROP POLICY IF EXISTS "profissional_delete_acesso" ON public.pacientes_acesso;
    CREATE POLICY "profissional_delete_acesso" ON public.pacientes_acesso
        FOR DELETE TO authenticated USING (criado_por = auth.uid());

    DROP POLICY IF EXISTS "anon_select_acesso" ON public.pacientes_acesso;
    CREATE POLICY "anon_select_acesso" ON public.pacientes_acesso
        FOR SELECT TO anon USING (ativo = true);

    -- Allow anon to read related patient data so dashboard works without auth session
    DROP POLICY IF EXISTS "anon_select_agendamentos" ON public.agendamentos;
    CREATE POLICY "anon_select_agendamentos" ON public.agendamentos FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "anon_update_agendamentos" ON public.agendamentos;
    CREATE POLICY "anon_update_agendamentos" ON public.agendamentos FOR UPDATE TO anon USING (true);

    DROP POLICY IF EXISTS "anon_select_anamnese" ON public.anamnese;
    CREATE POLICY "anon_select_anamnese" ON public.anamnese FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "anon_select_pacientes" ON public.pacientes;
    CREATE POLICY "anon_select_pacientes" ON public.pacientes FOR SELECT TO anon USING (true);
END $$;
