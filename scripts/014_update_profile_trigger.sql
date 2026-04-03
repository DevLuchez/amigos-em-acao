-- Atualizar trigger para incluir dados na tabela voluntarios

-- Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Criar nova função de trigger que popula tanto profiles quanto voluntarios
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_tipo TEXT;
  user_nome TEXT;
  user_email TEXT;
  user_telefone TEXT;
  user_recursos TEXT;
BEGIN
  -- Extrair dados do user_metadata
  user_tipo := NEW.raw_user_meta_data->>'tipo';
  user_nome := NEW.raw_user_meta_data->>'nome';
  user_email := NEW.email;
  user_telefone := NEW.raw_user_meta_data->>'telefone';
  user_recursos := NEW.raw_user_meta_data->>'recursos';

  -- Log para debug
  RAISE LOG 'Criando perfil para usuário: % (tipo: %)', NEW.id, user_tipo;

  -- Inserir na tabela profiles
  INSERT INTO public.profiles (id, nome, email, telefone, tipo)
  VALUES (
    NEW.id,
    COALESCE(user_nome, ''),
    user_email,
    COALESCE(user_telefone, ''),
    COALESCE(user_tipo, 'voluntario')
  );

  -- Se for voluntário, inserir também na tabela voluntarios
  IF COALESCE(user_tipo, 'voluntario') = 'voluntario' THEN
    RAISE LOG 'Criando registro de voluntário para: %', NEW.id;
    
    INSERT INTO public.voluntarios (id, nome, email, telefone, recursos)
    VALUES (
      NEW.id,
      COALESCE(user_nome, ''),
      user_email,
      COALESCE(user_telefone, ''),
      COALESCE(user_recursos, '')
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro ao criar perfil/voluntário: %', SQLERRM;
    RAISE;
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Comentário
COMMENT ON FUNCTION handle_new_user() IS 'Trigger que cria automaticamente perfil e registro de voluntário quando um novo usuário é criado';
