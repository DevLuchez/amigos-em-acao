-- Script de diagnóstico para identificar todas as políticas RLS e funções
-- Execute este script e compartilhe o resultado para identificar o problema

-- Listar todas as políticas RLS da tabela profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Listar todas as funções que podem estar causando problema
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%gestor%' 
   OR p.proname LIKE '%profile%'
   OR p.proname LIKE '%user%';

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'voluntarios', 'beneficiados');
