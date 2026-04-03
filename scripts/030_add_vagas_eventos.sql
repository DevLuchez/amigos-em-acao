-- Adicionar campos de quantidade mínima e máxima de voluntários
ALTER TABLE eventos
ADD COLUMN quantidade_minima_voluntarios INTEGER NOT NULL DEFAULT 1,
ADD COLUMN quantidade_maxima_voluntarios INTEGER;

-- Adicionar constraint para garantir que quantidade_maxima >= quantidade_minima
ALTER TABLE eventos
ADD CONSTRAINT check_quantidade_maxima 
CHECK (quantidade_maxima_voluntarios IS NULL OR quantidade_maxima_voluntarios >= quantidade_minima_voluntarios);
