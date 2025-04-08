/*
  # Create admin authentication

  1. Security
    - Enable email/password authentication
    - Create admin user
    - Set up RLS policies for admin access
*/

-- Enable email auth provider
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin user
DO $$
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin@barysgame.kz',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;
END $$;

-- Enable RLS on participants table
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read participants
CREATE POLICY "Allow authenticated users to read participants"
  ON participants
  FOR SELECT
  TO authenticated
  USING (true);