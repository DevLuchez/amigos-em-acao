-- Atualiza o trigger para incluir email na tabela profiles

-- Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Criar função atualizada que inclui email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_tipo TEXT;
  user_nome TEXT;
  user_telefone TEXT;
  user_recursos TEXT;
BEGIN
  -- Extrair dados do metadata
  user_tipo := COALESCE(NEW.raw_user_meta_data->>'tipo', 'voluntario');
  user_nome := COALESCE(NEW.raw_user_meta_data->>'nome', '');
  user_telefone := COALESCE(NEW.raw_user_meta_data->>'telefone', '');
  user_recursos := COALESCE(NEW.raw_user_meta_data->>'recursos', '');

  -- Inserir na tabela profiles (SEMPRE, para todos os tipos)
  INSERT INTO public.profiles (id, nome, email, telefone, tipo)
  VALUES (
    NEW.id,
    user_nome,
    NEW.email,  -- Agora incluindo email
    user_telefone,
    user_tipo
  );

  -- Se for voluntário, inserir também na tabela voluntarios
  IF user_tipo = 'voluntario' THEN
    INSERT INTO public.voluntarios (user_id, nome, email, telefone, recursos)
    VALUES (
      NEW.id,
      user_nome,
      NEW.email,
      user_telefone,
      user_recursos
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro no trigger handle_new_user: %', SQLERRM;
    RAISE;
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Trigger que cria automaticamente perfil e registro de voluntário após signup';
