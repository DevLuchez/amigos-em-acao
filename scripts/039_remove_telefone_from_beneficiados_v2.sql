-- Remove a coluna telefone obsoleta da tabela beneficiados
-- Esta coluna não é mais utilizada no formulário de cadastro de beneficiados

ALTER TABLE public.beneficiados DROP COLUMN IF EXISTS telefone;

-- Comentário para documentação
COMMENT ON TABLE public.beneficiados IS 'Tabela de beneficiados sem campo telefone (removido em 2025)';
