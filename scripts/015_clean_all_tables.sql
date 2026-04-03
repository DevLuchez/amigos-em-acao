-- Script para limpar todas as tabelas do banco de dados
-- ATENÇÃO: Este script irá deletar TODOS os dados das tabelas customizadas
-- Execute com cuidado!

-- Desabilitar triggers temporariamente para evitar problemas
ALTER TABLE profiles DISABLE TRIGGER ALL;
ALTER TABLE voluntarios DISABLE TRIGGER ALL;
ALTER TABLE beneficiados DISABLE TRIGGER ALL;
ALTER TABLE feedbacks DISABLE TRIGGER ALL;
ALTER TABLE eventos DISABLE TRIGGER ALL;
ALTER TABLE participacoes_eventos DISABLE TRIGGER ALL;

-- Deletar dados das tabelas (ordem importa devido às foreign keys)
DELETE FROM participacoes_eventos;
DELETE FROM feedbacks;
DELETE FROM eventos;
DELETE FROM voluntarios;
DELETE FROM beneficiados;
DELETE FROM profiles;

-- Reabilitar triggers
ALTER TABLE profiles ENABLE TRIGGER ALL;
ALTER TABLE voluntarios ENABLE TRIGGER ALL;
ALTER TABLE beneficiados ENABLE TRIGGER ALL;
ALTER TABLE feedbacks ENABLE TRIGGER ALL;
ALTER TABLE eventos ENABLE TRIGGER ALL;
ALTER TABLE participacoes_eventos ENABLE TRIGGER ALL;

-- Resetar sequences (auto-increment) se necessário
ALTER SEQUENCE IF EXISTS beneficiados_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS feedbacks_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS eventos_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS participacoes_eventos_id_seq RESTART WITH 1;

-- Nota: Para limpar também a tabela auth.users, você precisa:
-- 1. Ir no Supabase Dashboard
-- 2. Authentication → Users
-- 3. Selecionar e deletar os usuários manualmente
-- Ou usar a API administrativa do Supabase (requer service_role key)
