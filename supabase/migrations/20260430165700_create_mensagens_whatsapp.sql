CREATE TABLE IF NOT EXISTS public.mensagens_whatsapp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_whatsapp TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL,
    processada BOOLEAN DEFAULT false,
    resposta_ia TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mensagens_whatsapp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_mensagens_whatsapp" ON public.mensagens_whatsapp;
CREATE POLICY "authenticated_select_mensagens_whatsapp" ON public.mensagens_whatsapp 
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_mensagens_whatsapp" ON public.mensagens_whatsapp;
CREATE POLICY "authenticated_insert_mensagens_whatsapp" ON public.mensagens_whatsapp 
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_mensagens_whatsapp" ON public.mensagens_whatsapp;
CREATE POLICY "authenticated_update_mensagens_whatsapp" ON public.mensagens_whatsapp 
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_mensagens_whatsapp" ON public.mensagens_whatsapp;
CREATE POLICY "authenticated_delete_mensagens_whatsapp" ON public.mensagens_whatsapp 
    FOR DELETE TO authenticated USING (true);
