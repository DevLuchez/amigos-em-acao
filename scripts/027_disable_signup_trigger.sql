-- Desabilitar o trigger automático de criação de perfil
-- Agora o código da aplicação cria os registros manualmente

-- Remove o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove a função do trigger
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
