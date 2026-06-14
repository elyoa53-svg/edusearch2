
DO $$
DECLARE
  admin_id UUID;
  existing_id UUID;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = 'admin@edusearch.com';
  
  IF existing_id IS NULL THEN
    admin_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@edusearch.com',
      crypt('Admin2024!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      admin_id::text,
      admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'admin@edusearch.com'),
      'email',
      now(),
      now(),
      now()
    );

    INSERT INTO profiles (
      id, email, name, role, active, created_at
    ) VALUES (
      admin_id,
      'admin@edusearch.com',
      'Administrador General',
      'admin',
      true,
      now()
    );
  END IF;
END $$;
