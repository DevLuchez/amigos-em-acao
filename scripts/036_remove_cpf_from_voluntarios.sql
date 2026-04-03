-- Remove a coluna cpf da tabela voluntarios
ALTER TABLE public.voluntarios
DROP COLUMN IF EXISTS cpf;
