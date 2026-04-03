-- Adicionar campos de estrelas, nome e email à tabela feedbacks
ALTER TABLE public.feedbacks
ADD COLUMN IF NOT EXISTS estrelas INTEGER CHECK (estrelas >= 1 AND estrelas <= 5),
ADD COLUMN IF NOT EXISTS nome TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.feedbacks.estrelas IS 'Avaliação de 1 a 5 estrelas';
COMMENT ON COLUMN public.feedbacks.nome IS 'Nome do remetente (opcional, quando não é anônimo)';
COMMENT ON COLUMN public.feedbacks.email IS 'Email do remetente (opcional, quando não é anônimo)';
