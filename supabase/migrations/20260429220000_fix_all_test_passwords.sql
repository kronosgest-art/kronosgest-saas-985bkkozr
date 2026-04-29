DO $$
DECLARE
  v_new_id uuid;
BEGIN
  -- Fix Dra. Morgana (Profissional)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'dra.morganavieira@gmail.com') THEN
    UPDATE auth.users 
    SET encrypted_password = crypt('Skip@Pass', gen_salt('bf'))
    WHERE email = 'dra.morganavieira@gmail.com';
  ELSE
    v_new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_new_id, '00000000-0000-0000-0000-000000000000', 'dra.morganavieira@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Dra. Morgana Vieira", "role": "profissional"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
    
    INSERT INTO public.profissionais (id, user_id, nome_completo, especialidade)
    VALUES (gen_random_uuid(), v_new_id, 'Dra. Morgana Vieira', 'Medicina Integrativa')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Fix Marcelus (Paciente)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcelus@kronosgest.com') THEN
    UPDATE auth.users 
    SET encrypted_password = crypt('12345678900', gen_salt('bf'))
    WHERE email = 'marcelus@kronosgest.com';
  ELSE
    v_new_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_new_id, '00000000-0000-0000-0000-000000000000', 'marcelus@kronosgest.com', crypt('12345678900', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Marcelus", "role": "paciente"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );

    INSERT INTO public.pacientes (id, user_id, nome_completo, email, cpf)
    VALUES (gen_random_uuid(), v_new_id, 'Marcelus', 'marcelus@kronosgest.com', '12345678900')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Fix Admin
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@kronosgest.com') THEN
    UPDATE auth.users 
    SET encrypted_password = crypt('Admin@123456', gen_salt('bf'))
    WHERE email = 'admin@kronosgest.com';
  END IF;

  -- Fix Clinica
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'clinica@kronosgest.com') THEN
    UPDATE auth.users 
    SET encrypted_password = crypt('Clinica@123456', gen_salt('bf'))
    WHERE email = 'clinica@kronosgest.com';
  END IF;

END $$;
