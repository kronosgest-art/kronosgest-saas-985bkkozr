-- Create the trigger function to automatically create a professional profile
CREATE OR REPLACE FUNCTION public.handle_new_profissional()
RETURNS trigger AS $FUNCTION$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profissionais WHERE user_id = NEW.id) THEN
    INSERT INTO public.profissionais (user_id, nome_completo)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Profissional'));
  END IF;
  RETURN NEW;
END;
$FUNCTION$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_profissional ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_profissional
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profissional();

-- Retroactively create profiles for existing users who don't have one (e.g. 38ede419-33c2-4dfe-bc98-8e0e996f4acb)
DO $DO$
BEGIN
  INSERT INTO public.profissionais (user_id, nome_completo)
  SELECT id, COALESCE(raw_user_meta_data->>'name', email, 'Profissional')
  FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM public.profissionais WHERE user_id IS NOT NULL);
END $DO$;
