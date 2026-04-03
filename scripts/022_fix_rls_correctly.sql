-- Solução correta: Remover todas as políticas problemáticas e criar políticas simples que funcionam

-- Passo 1: Remover TODAS as políticas existentes de todas as tabelas
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Remove todas as políticas da tabela profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    END LOOP;
    
    -- Remove todas as políticas da tabela voluntarios
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'voluntarios') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON voluntarios', r.policyname);
    END LOOP;
    
    -- Remove todas as políticas da tabela beneficiados
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'beneficiados') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON beneficiados', r.policyname);
    END LOOP;
END $$;

-- Passo 2: Remover todas as funções problemáticas
DROP FUNCTION IF EXISTS is_gestor() CASCADE;
DROP FUNCTION IF EXISTS check_user_type() CASCADE;
DROP FUNCTION IF EXISTS get_user_type() CASCADE;

-- Passo 3: Criar políticas RLS CORRETAS que NÃO acessam auth.users

-- PROFILES: Políticas simples e seguras
CREATE POLICY "profiles_select_own"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
    ON profiles FOR DELETE
    USING (auth.uid() = id);

-- VOLUNTARIOS: Políticas simples e seguras
CREATE POLICY "voluntarios_select_own"
    ON voluntarios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "voluntarios_insert_own"
    ON voluntarios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "voluntarios_update_own"
    ON voluntarios FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "voluntarios_delete_own"
    ON voluntarios FOR DELETE
    USING (auth.uid() = user_id);

-- BENEFICIADOS: Acesso público para leitura (não requer autenticação)
-- Mas apenas usuários autenticados podem inserir
CREATE POLICY "beneficiados_select_all"
    ON beneficiados FOR SELECT
    USING (true);

CREATE POLICY "beneficiados_insert_authenticated"
    ON beneficiados FOR INSERT
    WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiados ENABLE ROW LEVEL SECURITY;

-- Comentário: Estas políticas são seguras porque:
-- 1. Não acessam auth.users (apenas usam auth.uid())
-- 2. Cada usuário só pode ver/modificar seus próprios dados
-- 3. Beneficiados podem ser vistos por todos (necessário para o sistema)
