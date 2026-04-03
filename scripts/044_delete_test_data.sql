-- Script para deletar dados de teste específicos
-- Execute este script no Supabase SQL Editor

-- 1. Deletar solicitações de ajuda dos beneficiados "fulaninho" e "vitor"
-- (As solicitações serão deletadas automaticamente devido ao CASCADE)
DELETE FROM solicitacoes_ajuda
WHERE beneficiado_id IN (
  SELECT id FROM beneficiados 
  WHERE nome ILIKE '%fulaninho%' OR nome ILIKE '%vitor%'
);

-- 2. Deletar os beneficiados "fulaninho" e "vitor"
DELETE FROM beneficiados
WHERE nome ILIKE '%fulaninho%' OR nome ILIKE '%vitor%';

-- 3. Deletar participações em eventos dos voluntários de teste
DELETE FROM participacoes_eventos
WHERE voluntario_id IN (
  SELECT id FROM profiles 
  WHERE nome ILIKE '%second voluntier%' OR nome ILIKE '%usuário teste%'
);

-- 4. Deletar solicitações atribuídas aos voluntários de teste
UPDATE solicitacoes_ajuda
SET voluntario_id = NULL
WHERE voluntario_id IN (
  SELECT id FROM profiles 
  WHERE nome ILIKE '%second voluntier%' OR nome ILIKE '%usuário teste%'
);

-- 5. Deletar os registros da tabela voluntarios
DELETE FROM voluntarios
WHERE nome ILIKE '%second voluntier%' OR nome ILIKE '%usuário teste%';

-- 6. Deletar os perfis (profiles) dos voluntários de teste
DELETE FROM profiles
WHERE nome ILIKE '%second voluntier%' OR nome ILIKE '%usuário teste%';

-- 7. Deletar usuários do Supabase Auth (precisa ser feito manualmente no dashboard)
-- Os IDs dos usuários que precisam ser deletados no Auth:
-- SELECT id, email, nome FROM profiles 
-- WHERE nome ILIKE '%second voluntier%' OR nome ILIKE '%usuário teste%';
-- Anote os IDs e delete manualmente em: Authentication > Users no Supabase Dashboard

-- Verificar resultados
SELECT 'Beneficiados restantes:', COUNT(*) FROM beneficiados;
SELECT 'Solicitações restantes:', COUNT(*) FROM solicitacoes_ajuda;
SELECT 'Voluntários restantes:', COUNT(*) FROM voluntarios;
SELECT 'Profiles restantes:', COUNT(*) FROM profiles;
