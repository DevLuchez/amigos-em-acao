-- IMPORTANTE: Este script deve ser executado APENAS se você tem acesso ao Service Role
-- Normalmente, a deleção de usuários do Auth deve ser feita manualmente no dashboard

-- Para deletar usuários do Supabase Auth via SQL (requer Service Role):
-- 1. Primeiro, identifique os IDs dos usuários que deseja deletar:

SELECT 
  id as user_id,
  email,
  nome
FROM profiles
WHERE nome ILIKE '%second voluntier%' OR nome ILIKE '%usuário teste%';

-- 2. Anote os user_ids retornados acima
-- 3. Vá para o Supabase Dashboard > Authentication > Users
-- 4. Busque pelos emails mostrados acima
-- 5. Clique nos 3 pontinhos (...) ao lado de cada usuário
-- 6. Selecione "Delete user"

-- Alternativamente, se você tem a extensão pg_net ou acesso direto ao Auth:
-- DELETE FROM auth.users WHERE id IN ('user-id-1', 'user-id-2');
-- (Substitua pelos IDs reais obtidos na query acima)
