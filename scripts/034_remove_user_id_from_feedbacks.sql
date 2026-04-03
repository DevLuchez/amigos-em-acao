-- Remove a coluna user_id da tabela feedbacks e ajusta as políticas RLS
-- A identificação agora é feita pelos campos nome e email quando não é anônimo

-- Remover políticas RLS antigas que dependem de user_id
DROP POLICY IF EXISTS "Usuários podem ver seus próprios feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "feedbacks_insert_own" ON public.feedbacks;
DROP POLICY IF EXISTS "feedbacks_update_own" ON public.feedbacks;
DROP POLICY IF EXISTS "feedbacks_delete_own" ON public.feedbacks;
DROP POLICY IF EXISTS "Gestores podem ver todos os feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Qualquer um pode enviar feedback" ON public.feedbacks;

-- Remover a coluna user_id
ALTER TABLE public.feedbacks DROP COLUMN IF EXISTS user_id;

-- Criar novas políticas RLS sem user_id
-- Qualquer um pode inserir feedback (público, sem autenticação)
CREATE POLICY "feedbacks_insert_public" ON public.feedbacks
  FOR INSERT WITH CHECK (true);

-- Apenas gestores podem ver todos os feedbacks
CREATE POLICY "feedbacks_select_gestores" ON public.feedbacks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'gestor'
    )
  );

-- Apenas gestores podem atualizar feedbacks
CREATE POLICY "feedbacks_update_gestores" ON public.feedbacks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'gestor'
    )
  );

-- Apenas gestores podem deletar feedbacks
CREATE POLICY "feedbacks_delete_gestores" ON public.feedbacks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'gestor'
    )
  );
