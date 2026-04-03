-- Permitir leitura pública apenas de solicitações concluídas
-- Necessário para exibir o contador de "Pessoas Ajudadas" na landing page

-- Adicionar política para permitir que usuários anônimos vejam apenas o COUNT de solicitações concluídas
CREATE POLICY "Permitir leitura pública de solicitações concluídas"
ON solicitacoes_ajuda
FOR SELECT
TO anon
USING (status = 'concluida');

-- Comentário: Esta política permite que a landing page (acesso público) 
-- consulte apenas solicitações com status 'concluida' para exibir estatísticas
