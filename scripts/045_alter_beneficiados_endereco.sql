-- Alterar tabela beneficiados para substituir cep por novos campos de endereço
ALTER TABLE public.beneficiados DROP COLUMN IF EXISTS cep;

ALTER TABLE public.beneficiados
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS complemento text;
