-- Remove a coluna tamanho_familiar da tabela beneficiados
ALTER TABLE beneficiados
DROP COLUMN IF EXISTS tamanho_familiar;

-- As colunas cep e descricao já existem no banco conforme o schema
