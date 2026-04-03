-- Script para limpar usuários órfãos (existem em auth.users mas não em profiles)
-- Use este script quando precisar deletar completamente um usuário do sistema

-- ATENÇÃO: Substitua 'email@exemplo.com' pelo email do usuário que deseja deletar
-- Este script deleta o usuário de TODAS as tabelas, incluindo auth.users

DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Busca o UUID do usuário pelo email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = 'laura@uorak.com'; -- SUBSTITUA pelo email desejado

  IF user_uuid IS NOT NULL THEN
    -- Deleta de voluntarios (se existir)
    DELETE FROM public.voluntarios WHERE id = user_uuid;
    RAISE NOTICE 'Deletado de voluntarios: %', user_uuid;

    -- Deleta de profiles (se existir)
    DELETE FROM public.profiles WHERE id = user_uuid;
    RAISE NOTICE 'Deletado de profiles: %', user_uuid;

    -- Deleta de auth.users
    DELETE FROM auth.users WHERE id = user_uuid;
    RAISE NOTICE 'Deletado de auth.users: %', user_uuid;

    RAISE NOTICE 'Usuário % deletado completamente do sistema', user_uuid;
  ELSE
    RAISE NOTICE 'Usuário com email não encontrado';
  END IF;
END $$;
