-- Atualizar tabela de eventos para incluir campo de visibilidade pública
ALTER TABLE public.eventos 
ADD COLUMN IF NOT EXISTS publico boolean DEFAULT false;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.eventos.publico IS 'Se true, o evento aparece na landing page. Se false, apenas para voluntários cadastrados.';
