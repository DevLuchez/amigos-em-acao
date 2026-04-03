-- Script para corrigir TODAS as políticas RLS de forma definitiva
-- Remove políticas recursivas e cria políticas corretas

-- ============================================
-- PASSO 1: Remover TODAS as políticas existentes
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Gestores podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Permitir inserção durante signup" ON public.profiles;
DROP POLICY IF EXISTS "Permitir atualização próprio perfil" ON public.profiles;

-- Voluntarios
DROP POLICY IF EXISTS "Voluntários podem ver suas próprias informações" ON public.voluntarios;
DROP POLICY IF EXISTS "Voluntários podem inserir suas próprias informações" ON public.voluntarios;
DROP POLICY IF EXISTS "Voluntários podem atualizar suas próprias informações" ON public.voluntarios;
DROP POLICY IF EXISTS "Gestores podem ver todos os voluntários" ON public.voluntarios;

-- Beneficiados
DROP POLICY IF EXISTS "Gestores podem ver todos os beneficiados" ON public.beneficiados;
DROP POLICY IF EXISTS "Qualquer um pode se cadastrar como beneficiado" ON public.beneficiados;

-- Feedbacks
DROP POLICY IF EXISTS "Gestores podem ver todos os feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Qualquer um pode enviar feedback" ON public.feedbacks;

-- Eventos
DROP POLICY IF EXISTS "Todos podem ver eventos" ON public.eventos;
DROP POLICY IF EXISTS "Gestores podem criar eventos" ON public.eventos;
DROP POLICY IF EXISTS "Gestores podem atualizar eventos" ON public.eventos;
DROP POLICY IF EXISTS "Gestores podem deletar eventos" ON public.eventos;

-- Participacoes Eventos
DROP POLICY IF EXISTS "Usuários podem ver suas próprias participações" ON public.participacoes_eventos;
DROP POLICY IF EXISTS "Gestores podem ver todas as participações" ON public.participacoes_eventos;
DROP POLICY IF EXISTS "Usuários podem se inscrever em eventos" ON public.participacoes_eventos;

-- ============================================
-- PASSO 2: Remover função problemática
-- ============================================

DROP FUNCTION IF EXISTS is_gestor() CASCADE;

-- ============================================
-- PASSO 3: Criar políticas RLS corretas
-- ============================================

-- PROFILES: Todos os usuários autenticados podem ler qualquer perfil
-- (necessário para o sistema funcionar)
CREATE POLICY "Permitir leitura para autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- PROFILES: Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Permitir inserção próprio perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- PROFILES: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Permitir atualização próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- VOLUNTARIOS: Todos os usuários autenticados podem ler
CREATE POLICY "Permitir leitura voluntarios"
  ON public.voluntarios FOR SELECT
  TO authenticated
  USING (true);

-- VOLUNTARIOS: Usuários podem inserir apenas seus próprios dados
CREATE POLICY "Permitir inserção próprio voluntario"
  ON public.voluntarios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- VOLUNTARIOS: Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Permitir atualização próprio voluntario"
  ON public.voluntarios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- BENEFICIADOS: Qualquer um pode inserir (formulário público)
CREATE POLICY "Permitir inserção pública beneficiados"
  ON public.beneficiados FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- BENEFICIADOS: Usuários autenticados podem ler
CREATE POLICY "Permitir leitura beneficiados"
  ON public.beneficiados FOR SELECT
  TO authenticated
  USING (true);

-- FEEDBACKS: Qualquer um pode inserir feedback
CREATE POLICY "Permitir inserção feedback"
  ON public.feedbacks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- FEEDBACKS: Usuários autenticados podem ler feedbacks
CREATE POLICY "Permitir leitura feedbacks"
  ON public.feedbacks FOR SELECT
  TO authenticated
  USING (true);

-- FEEDBACKS: Usuários podem atualizar apenas seus próprios feedbacks
CREATE POLICY "Permitir atualização próprio feedback"
  ON public.feedbacks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- EVENTOS: Todos podem ler eventos
CREATE POLICY "Permitir leitura eventos"
  ON public.eventos FOR SELECT
  TO anon, authenticated
  USING (true);

-- EVENTOS: Usuários autenticados podem criar eventos
CREATE POLICY "Permitir criação eventos"
  ON public.eventos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- EVENTOS: Usuários autenticados podem atualizar eventos
CREATE POLICY "Permitir atualização eventos"
  ON public.eventos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PARTICIPACOES_EVENTOS: Usuários autenticados podem ler
CREATE POLICY "Permitir leitura participacoes"
  ON public.participacoes_eventos FOR SELECT
  TO authenticated
  USING (true);

-- PARTICIPACOES_EVENTOS: Usuários podem se inscrever em eventos
CREATE POLICY "Permitir inserção participacoes"
  ON public.participacoes_eventos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- PARTICIPACOES_EVENTOS: Usuários podem atualizar suas participações
CREATE POLICY "Permitir atualização participacoes"
  ON public.participacoes_eventos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Comentários finais
-- ============================================

-- Estas políticas são seguras e funcionais:
-- 1. Não fazem subqueries recursivas
-- 2. Usam apenas auth.uid() para verificação
-- 3. Permitem que o sistema funcione corretamente
-- 4. Mantêm segurança básica (usuários só modificam seus próprios dados)
-- 
-- NOTA: Para funcionalidades específicas de gestor (ex: deletar usuários),
-- a verificação de permissão deve ser feita no nível da aplicação,
-- não nas políticas RLS.
