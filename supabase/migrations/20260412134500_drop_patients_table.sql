-- Drop RLS policies attached to the duplicate patients table
DROP POLICY IF EXISTS "patients_user_isolation" ON public.patients;

-- Drop the duplicate and empty patients table safely
DROP TABLE IF EXISTS public.patients CASCADE;
