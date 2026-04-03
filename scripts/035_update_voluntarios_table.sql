-- Remove coluna recursos e adiciona coluna cpf na tabela voluntarios
ALTER TABLE public.voluntarios
DROP COLUMN IF EXISTS recursos;

ALTER TABLE public.voluntarios
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.voluntarios.cpf IS 'CPF do voluntário formatado (000.000.000-00)';
