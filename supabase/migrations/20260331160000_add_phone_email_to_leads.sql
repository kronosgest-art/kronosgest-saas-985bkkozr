-- Add phone and email to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;
