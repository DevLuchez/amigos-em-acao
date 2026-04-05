-- Remove a restrição (check constraint) das categorias de evento para permitir novas categorias locais
ALTER TABLE public.eventos DROP CONSTRAINT IF EXISTS eventos_categoria_check;
