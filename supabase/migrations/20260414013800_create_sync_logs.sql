CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sync_logs_user_isolation" ON public.sync_logs;
CREATE POLICY "sync_logs_user_isolation" ON public.sync_logs
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profissionais 
      WHERE profissionais.id = sync_logs.profissional_id 
      AND profissionais.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profissionais 
      WHERE profissionais.id = sync_logs.profissional_id 
      AND profissionais.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "sync_logs_insert" ON public.sync_logs;
CREATE POLICY "sync_logs_insert" ON public.sync_logs
  FOR INSERT TO authenticated WITH CHECK (true);
