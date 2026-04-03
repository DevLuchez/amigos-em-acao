-- Script para corrigir políticas RLS de todas as tabelas
-- Remove políticas problemáticas que fazem subqueries recursivas
-- Cria políticas simples e seguras baseadas na estrutura real de cada tabela

-- ============================================
-- TABELA: profiles
-- Estrutura: id (PK, referencia auth.users.id), nome, email, telefone, tipo
-- ============================================

-- Remover todas as políticas existentes de profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Gestores podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Permitir inserção durante signup" ON public.profiles;
DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir deleção do próprio perfil" ON public.profiles;

-- Criar políticas simples para profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- ============================================
-- TABELA: voluntarios
-- Estrutura: id (PK, referencia profiles.id), como_pode_ajudar, nome, email, telefone
-- ============================================

-- Remover todas as políticas existentes de voluntarios
DROP POLICY IF EXISTS "Voluntários podem ver suas próprias informações" ON public.voluntarios;
DROP POLICY IF EXISTS "Voluntários podem inserir suas próprias informações" ON public.voluntarios;
DROP POLICY IF EXISTS "Voluntários podem atualizar suas próprias informações" ON public.voluntarios;
DROP POLICY IF EXISTS "Gestores podem ver todos os voluntários" ON public.voluntarios;

-- Criar políticas simples para voluntarios
CREATE POLICY "voluntarios_select_all" ON public.voluntarios
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "voluntarios_insert_own" ON public.voluntarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "voluntarios_update_own" ON public.voluntarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "voluntarios_delete_own" ON public.voluntarios
  FOR DELETE USING (auth.uid() = id);

-- ============================================
-- TABELA: beneficiados
-- Estrutura: id (PK), nome, email, telefone, tamanho_familiar, necessidade
-- Não precisa de autenticação - acesso público para cadastro
-- ============================================

-- Remover todas as políticas existentes de beneficiados
DROP POLICY IF EXISTS "Todos podem inserir beneficiados" ON public.beneficiados;
DROP POLICY IF EXISTS "Gestores podem ver todos os beneficiados" ON public.beneficiados;
DROP POLICY IF EXISTS "Gestores podem atualizar beneficiados" ON public.beneficiados;
DROP POLICY IF EXISTS "Gestores podem deletar beneficiados" ON public.beneficiados;

-- Criar políticas para beneficiados (acesso público para leitura e inserção)
CREATE POLICY "beneficiados_select_all" ON public.beneficiados
  FOR SELECT USING (true);

CREATE POLICY "beneficiados_insert_public" ON public.beneficiados
  FOR INSERT WITH CHECK (true);

CREATE POLICY "beneficiados_update_all" ON public.beneficiados
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "beneficiados_delete_all" ON public.beneficiados
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: feedbacks
-- Estrutura: id (PK), user_id (FK para profiles), mensagem
-- ============================================

-- Remover todas as políticas existentes de feedbacks
DROP POLICY IF EXISTS "Usuários podem criar feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Gestores podem ver todos os feedbacks" ON public.feedbacks;

-- Criar políticas para feedbacks
CREATE POLICY "feedbacks_select_all" ON public.feedbacks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "feedbacks_insert_own" ON public.feedbacks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedbacks_update_own" ON public.feedbacks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "feedbacks_delete_own" ON public.feedbacks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TABELA: eventos
-- Estrutura: id (PK), titulo, descricao, categoria, data, status
-- ============================================

-- Remover todas as políticas existentes de eventos
DROP POLICY IF EXISTS "Todos podem ver eventos" ON public.eventos;
DROP POLICY IF EXISTS "Gestores podem criar eventos" ON public.eventos;
DROP POLICY IF EXISTS "Gestores podem atualizar eventos" ON public.eventos;
DROP POLICY IF EXISTS "Gestores podem deletar eventos" ON public.eventos;

-- Criar políticas para eventos (todos podem ver, autenticados podem modificar)
CREATE POLICY "eventos_select_all" ON public.eventos
  FOR SELECT USING (true);

CREATE POLICY "eventos_insert_auth" ON public.eventos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "eventos_update_auth" ON public.eventos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "eventos_delete_auth" ON public.eventos
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: participacoes_eventos
-- Estrutura: id (PK), evento_id (FK), voluntario_id (FK para profiles)
-- ============================================

-- Remover todas as políticas existentes de participacoes_eventos
DROP POLICY IF EXISTS "Voluntários podem ver suas próprias participações" ON public.participacoes_eventos;
DROP POLICY IF EXISTS "Voluntários podem confirmar participação" ON public.participacoes_eventos;
DROP POLICY IF EXISTS "Voluntários podem cancelar participação" ON public.participacoes_eventos;
DROP POLICY IF EXISTS "Gestores podem ver todas as participações" ON public.participacoes_eventos;

-- Criar políticas para participacoes_eventos
CREATE POLICY "participacoes_select_all" ON public.participacoes_eventos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "participacoes_insert_own" ON public.participacoes_eventos
  FOR INSERT WITH CHECK (auth.uid() = voluntario_id);

CREATE POLICY "participacoes_update_own" ON public.participacoes_eventos
  FOR UPDATE USING (auth.uid() = voluntario_id);

CREATE POLICY "participacoes_delete_own" ON public.participacoes_eventos
  FOR DELETE USING (auth.uid() = voluntario_id);
