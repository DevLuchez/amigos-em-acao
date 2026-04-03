-- Adicionar campos faltantes na tabela voluntarios
ALTER TABLE voluntarios 
ADD COLUMN IF NOT EXISTS nome TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Adicionar comentários para documentação
COMMENT ON TABLE voluntarios IS 'Armazena informações de voluntários cadastrados';
COMMENT ON COLUMN voluntarios.nome IS 'Nome completo do voluntário';
COMMENT ON COLUMN voluntarios.email IS 'Email do voluntário';
COMMENT ON COLUMN voluntarios.telefone IS 'Telefone do voluntário';
COMMENT ON COLUMN voluntarios.recursos IS 'Como o voluntário pode ajudar';
