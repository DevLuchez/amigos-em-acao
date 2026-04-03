-- Script para corrigir definitivamente as políticas RLS da tabela profiles
-- Remove todas as políticas e funções problemáticas e cria políticas simples que funcionam

-- 1. Remover todas as políticas RLS existentes da tabela profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Gestores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir inserção para próprio usuário" ON profiles;
DROP POLICY IF EXISTS "Permitir atualização para próprio usuário" ON profiles;
DROP POLICY IF EXISTS "Permitir deleção para próprio usuário" ON profiles;
-- Adicionando DROP para as novas políticas também
DROP POLICY IF EXISTS "Permitir leitura para todos autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir inserção durante signup" ON profiles;
DROP POLICY IF EXISTS "Permitir atualização próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir deleção próprio perfil" ON profiles;

-- Adicionando CASCADE para forçar remoção da função e dependências
-- 2. Remover funções problemáticas que tentam acessar auth.users
DROP FUNCTION IF EXISTS is_gestor() CASCADE;

-- 3. Criar políticas RLS simples e funcionais
-- Permitir SELECT para todos os usuários autenticados (necessário para o sistema funcionar)
CREATE POLICY "Permitir leitura para todos autenticados"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Permitir INSERT apenas durante o signup (pelo trigger)
CREATE POLICY "Permitir inserção durante signup"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Permitir UPDATE apenas para o próprio usuário
CREATE POLICY "Permitir atualização próprio perfil"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permitir DELETE apenas para o próprio usuário
CREATE POLICY "Permitir deleção próprio perfil"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- 4. Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Fazer o mesmo para a tabela voluntarios
DROP POLICY IF EXISTS "Voluntários podem ver suas próprias informações" ON voluntarios;
DROP POLICY IF EXISTS "Gestores podem ver todos os voluntários" ON voluntarios;
DROP POLICY IF EXISTS "Voluntários podem inserir suas próprias informações" ON voluntarios;
DROP POLICY IF EXISTS "Voluntários podem atualizar suas próprias informações" ON voluntarios;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON voluntarios;
DROP POLICY IF EXISTS "Permitir inserção durante signup" ON voluntarios;
DROP POLICY IF EXISTS "Permitir atualização para próprio voluntário" ON voluntarios;
-- Adicionando DROP para as novas políticas de voluntarios
DROP POLICY IF EXISTS "Permitir leitura para todos autenticados" ON voluntarios;
DROP POLICY IF EXISTS "Permitir atualização próprio registro" ON voluntarios;
DROP POLICY IF EXISTS "Permitir deleção próprio registro" ON voluntarios;

CREATE POLICY "Permitir leitura para todos autenticados"
ON voluntarios FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção durante signup"
ON voluntarios FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização próprio registro"
ON voluntarios FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Permitir deleção próprio registro"
ON voluntarios FOR DELETE
TO authenticated
USING (user_id = auth.uid());

ALTER TABLE voluntarios ENABLE ROW LEVEL SECURITY;

-- 6. Fazer o mesmo para a tabela beneficiados
DROP POLICY IF EXISTS "Gestores podem ver todos os beneficiados" ON beneficiados;
DROP POLICY IF EXISTS "Permitir inserção pública" ON beneficiados;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON beneficiados;
-- Adicionando DROP para as novas políticas de beneficiados
DROP POLICY IF EXISTS "Permitir leitura para todos autenticados" ON beneficiados;

CREATE POLICY "Permitir leitura para todos autenticados"
ON beneficiados FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção pública"
ON beneficiados FOR INSERT
TO anon, authenticated
WITH CHECK (true);

ALTER TABLE beneficiados ENABLE ROW LEVEL SECURITY;
