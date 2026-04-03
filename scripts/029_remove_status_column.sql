-- Remove a coluna status da tabela eventos
-- O status será calculado dinamicamente baseado na data/hora do evento

ALTER TABLE public.eventos DROP COLUMN IF EXISTS status;

-- Atualizar comentário da tabela
COMMENT ON TABLE public.eventos IS 'Tabela de eventos - status calculado dinamicamente baseado na data';
