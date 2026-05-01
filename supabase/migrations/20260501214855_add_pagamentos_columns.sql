ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS data_pagamento TIMESTAMPTZ;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS invoice_slug TEXT;
