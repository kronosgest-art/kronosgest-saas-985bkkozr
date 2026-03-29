DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Admin
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@kronosgest.com') THEN
    UPDATE auth.users 
    SET encrypted_password = crypt('Admin@123456', gen_salt('bf')),
        raw_user_meta_data = '{"role": "admin"}'
    WHERE email = 'admin@kronosgest.com';
  ELSE
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'admin@kronosgest.com',
      crypt('Admin@123456', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"role": "admin"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Clínica
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'clinica@kronosgest.com') THEN
    UPDATE auth.users 
    SET encrypted_password = crypt('Clinica@123456', gen_salt('bf')),
        raw_user_meta_data = '{"role": "clinica"}'
    WHERE email = 'clinica@kronosgest.com';
  ELSE
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'clinica@kronosgest.com',
      crypt('Clinica@123456', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"role": "clinica"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Paciente
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'paciente@kronosgest.com') THEN
    UPDATE auth.users 
    SET encrypted_password = crypt('Paciente@123456', gen_salt('bf')),
        raw_user_meta_data = '{"role": "cliente"}'
    WHERE email = 'paciente@kronosgest.com';
  ELSE
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'paciente@kronosgest.com',
      crypt('Paciente@123456', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"role": "cliente"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;
