-- Função para verificar se um email já existe
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_to_check
  );
END;
$$;

-- Permitir que usuários autenticados chamem esta função
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon;
