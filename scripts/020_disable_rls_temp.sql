-- Script temporário para desabilitar RLS e permitir desenvolvimento
-- ATENÇÃO: Este script desabilita segurança. Use apenas em desenvolvimento!

-- Desabilitar RLS em todas as tabelas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE voluntarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiados DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE participacoes_eventos DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir inserção durante signup" ON profiles;
DROP POLICY IF EXISTS "Gestores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Todos podem ler profiles" ON profiles;

DROP POLICY IF EXISTS "Voluntários podem ver suas próprias informações" ON voluntarios;
DROP POLICY IF EXISTS "Voluntários podem inserir suas próprias informações" ON voluntarios;
DROP POLICY IF EXISTS "Voluntários podem atualizar suas próprias informações" ON voluntarios;
DROP POLICY IF EXISTS "Gestores podem ver todos os voluntários" ON voluntarios;

DROP POLICY IF EXISTS "Beneficiados podem ver suas próprias informações" ON beneficiados;
DROP POLICY IF EXISTS "Beneficiados podem inserir suas próprias informações" ON beneficiados;
DROP POLICY IF EXISTS "Gestores podem ver todos os beneficiados" ON beneficiados;

-- Remover função problemática
DROP FUNCTION IF EXISTS is_gestor() CASCADE;

-- Nota: Para reabilitar RLS em produção, execute:
-- ALTER TABLE [nome_tabela] ENABLE ROW LEVEL SECURITY;
-- E crie políticas apropriadas
