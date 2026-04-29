-- 1. Add deleted_at column for soft delete
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Drop unique constraints that block soft-deleted records from sharing the same CPF/email
ALTER TABLE public.pacientes DROP CONSTRAINT IF EXISTS pacientes_cpf_key;
ALTER TABLE public.pacientes DROP CONSTRAINT IF EXISTS pacientes_email_key;
DROP INDEX IF EXISTS pacientes_cpf_key;
DROP INDEX IF EXISTS pacientes_email_key;

-- 3. Create partial unique indexes for active patients
CREATE UNIQUE INDEX IF NOT EXISTS pacientes_cpf_active_idx 
  ON public.pacientes (cpf) 
  WHERE deleted_at IS NULL AND status != 'deletado' AND cpf IS NOT NULL AND cpf != '';

CREATE UNIQUE INDEX IF NOT EXISTS pacientes_email_active_idx 
  ON public.pacientes (email) 
  WHERE deleted_at IS NULL AND status != 'deletado' AND email IS NOT NULL AND email != '';

-- 4. Cleanup operations requested by user
DO $$
BEGIN
  -- Delete orphaned records in related tables for 'Marcelus'
  DELETE FROM public.agendamentos 
  WHERE patient_id IN (SELECT id FROM public.pacientes WHERE nome_completo ILIKE '%Marcelus%');
  
  DELETE FROM public.consultas 
  WHERE patient_id IN (SELECT id FROM public.pacientes WHERE nome_completo ILIKE '%Marcelus%');
  
  DELETE FROM public.exames 
  WHERE patient_id IN (SELECT id FROM public.pacientes WHERE nome_completo ILIKE '%Marcelus%');
  
  DELETE FROM public.prescricoes 
  WHERE patient_id IN (SELECT id FROM public.pacientes WHERE nome_completo ILIKE '%Marcelus%');
  
  DELETE FROM public.tcle_assinado 
  WHERE patient_id IN (SELECT id FROM public.pacientes WHERE nome_completo ILIKE '%Marcelus%');
  
  DELETE FROM public.transacoes_financeiras 
  WHERE patient_id IN (SELECT id FROM public.pacientes WHERE nome_completo ILIKE '%Marcelus%');

  DELETE FROM public.vendas 
  WHERE patient_id IN (SELECT id FROM public.pacientes WHERE nome_completo ILIKE '%Marcelus%');
  
  -- Finally delete Marcelus completely (hard delete)
  DELETE FROM public.pacientes WHERE nome_completo ILIKE '%Marcelus%';

  -- Delete completely orphaned records (no user_id and no organization_id)
  DELETE FROM public.pacientes WHERE user_id IS NULL AND organization_id IS NULL;
END $$;
