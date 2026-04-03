-- Permitir leitura pública da tabela voluntarios para contagem na landing page
-- Mantém as outras políticas de segurança intactas

-- Remover a política atual que requer autenticação
DROP POLICY IF EXISTS "voluntarios_select_all" ON public.voluntarios;

-- Criar nova política que permite leitura pública (para contagem na landing page)
CREATE POLICY "voluntarios_select_public" ON public.voluntarios
  FOR SELECT USING (true);

-- Manter as políticas de modificação apenas para usuários autenticados
-- (as políticas de INSERT, UPDATE e DELETE já existem e continuam válidas)
