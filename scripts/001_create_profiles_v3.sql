-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Gestores can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Gestores can update all profiles" ON profiles;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS is_gestor();

-- Create table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('gestor', 'voluntario')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to check if current user is gestor
CREATE OR REPLACE FUNCTION is_gestor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND tipo = 'gestor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Gestores can view all profiles (using the function)
CREATE POLICY "Gestores can view all profiles"
  ON profiles
  FOR SELECT
  USING (is_gestor());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Gestores can update all profiles
CREATE POLICY "Gestores can update all profiles"
  ON profiles
  FOR UPDATE
  USING (is_gestor());

-- Policy: Allow insert during signup (will be restricted by trigger)
CREATE POLICY "Allow profile creation"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_tipo ON profiles(tipo);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
