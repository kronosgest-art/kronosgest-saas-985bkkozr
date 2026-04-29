DO $$
DECLARE
  v_admin_id uuid := gen_random_uuid();
  v_clinica_id uuid := gen_random_uuid();
  v_prof_id uuid := gen_random_uuid();
  v_paciente_id uuid := gen_random_uuid();
  v_org_id uuid := gen_random_uuid();
  v_paciente_record_id uuid := gen_random_uuid();
  v_existing_prof_id uuid;
BEGIN
  -- Org
  INSERT INTO public.organizations (id, nome) 
  VALUES (v_org_id, 'Clínica KronosGest') 
  ON CONFLICT DO NOTHING;

  -- Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@kronosgest.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'admin@kronosgest.com', crypt('Admin@123456', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin", "role": "admin"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Clinica
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'clinica@kronosgest.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_clinica_id, '00000000-0000-0000-0000-000000000000', 'clinica@kronosgest.com', crypt('Clinica@123456', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Clínica", "role": "clinica"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Profissional
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dra.morganavieira@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_prof_id, '00000000-0000-0000-0000-000000000000', 'dra.morganavieira@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Dra. Morgana Vieira", "role": "profissional"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
    
    INSERT INTO public.profissionais (id, user_id, organization_id, nome_completo, especialidade)
    VALUES (gen_random_uuid(), v_prof_id, (SELECT id FROM public.organizations LIMIT 1), 'Dra. Morgana Vieira', 'Medicina Integrativa')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Get prof id for the patient's record
  SELECT id INTO v_existing_prof_id FROM auth.users WHERE email = 'dra.morganavieira@gmail.com' LIMIT 1;

  -- Paciente Marcelus
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcelus@kronosgest.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_paciente_id, '00000000-0000-0000-0000-000000000000', 'marcelus@kronosgest.com', crypt('12345678900', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Marcelus", "role": "paciente"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );

    INSERT INTO public.pacientes (id, user_id, organization_id, nome_completo, email, cpf)
    VALUES (v_paciente_record_id, v_paciente_id, (SELECT id FROM public.organizations LIMIT 1), 'Marcelus', 'marcelus@kronosgest.com', '12345678900')
    ON CONFLICT DO NOTHING;

    IF v_existing_prof_id IS NOT NULL THEN
      INSERT INTO public.pacientes_acesso (id, paciente_id, email, cpf, ativo, criado_por)
      VALUES (gen_random_uuid(), v_paciente_record_id, 'marcelus@kronosgest.com', '12345678900', true, v_existing_prof_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

END $$;
