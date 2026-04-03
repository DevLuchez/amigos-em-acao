-- This script fixes the RLS recursion issue by using a different approach
-- We'll grant the is_gestor function permission to bypass RLS

-- First, ensure the function exists and is properly configured
CREATE OR REPLACE FUNCTION is_gestor()
RETURNS BOOLEAN AS $$
DECLARE
  user_tipo TEXT;
BEGIN
  -- Get the tipo directly without triggering RLS
  SELECT tipo INTO user_tipo
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_tipo = 'gestor';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_gestor() TO authenticated;

-- Recreate the policies with the fixed function
DROP POLICY IF EXISTS "Gestores can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Gestores can update all profiles" ON profiles;

CREATE POLICY "Gestores can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id OR is_gestor()
  );

CREATE POLICY "Gestores can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR is_gestor()
  );
