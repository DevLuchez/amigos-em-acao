-- Corrige o trigger de signup para usar os nomes de colunas corretos

-- Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Criar função corrigida
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
  user_como_pode_ajudar TEXT;
BEGIN
  -- Extrair dados do metadata
  user_tipo := COALESCE(NEW.raw_user_meta_data->>'tipo', 'voluntario');
  user_nome := COALESCE(NEW.raw_user_meta_data->>'nome', '');
  user_telefone := COALESCE(NEW.raw_user_meta_data->>'telefone', '');
  -- Corrigido para buscar 'como_pode_ajudar' ao invés de 'recursos'
  user_como_pode_ajudar := COALESCE(NEW.raw_user_meta_data->>'como_pode_ajudar', '');

  RAISE LOG '[v0] Trigger handle_new_user iniciado para user_id: %, tipo: %, nome: %', NEW.id, user_tipo, user_nome;

  -- Inserir na tabela profiles (SEMPRE, para todos os tipos)
  INSERT INTO public.profiles (id, nome, email, telefone, tipo)
  VALUES (
    NEW.id,
    user_nome,
    NEW.email,
    user_telefone,
    user_tipo
  );

  RAISE LOG '[v0] Perfil criado com sucesso para user_id: %', NEW.id;

  -- Se for voluntário, inserir também na tabela voluntarios
  IF user_tipo = 'voluntario' THEN
    -- Corrigido para usar 'id' ao invés de 'user_id' e 'como_pode_ajudar' ao invés de 'recursos'
    INSERT INTO public.voluntarios (id, nome, email, telefone, como_pode_ajudar)
    VALUES (
      NEW.id,
      user_nome,
      NEW.email,
      user_telefone,
      user_como_pode_ajudar
    );
    
    RAISE LOG '[v0] Registro de voluntário criado com sucesso para user_id: %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[v0] Erro no trigger handle_new_user: %, SQLSTATE: %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Trigger que cria automaticamente perfil e registro de voluntário após signup';
