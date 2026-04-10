-- Readiciona a coluna telefone na tabela beneficiados
ALTER TABLE public.beneficiados
ADD COLUMN IF NOT EXISTS telefone text;
