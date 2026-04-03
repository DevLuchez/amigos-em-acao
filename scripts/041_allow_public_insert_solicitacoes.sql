-- Adicionar política para permitir inserções públicas na tabela solicitacoes_ajuda
-- Isso é necessário porque o formulário "Procuro Ajuda" é público (não requer login)

CREATE POLICY solicitacoes_public_insert ON public.solicitacoes_ajuda
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Permite que qualquer pessoa não autenticada crie uma solicitação
    -- desde que seja com status 'nova' (valor padrão do formulário)
    status = 'nova'
  );

-- Também permitir para usuários autenticados criarem solicitações
CREATE POLICY solicitacoes_authenticated_insert ON public.solicitacoes_ajuda
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
