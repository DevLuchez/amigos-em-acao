-- Adiciona campo para armazenar quantidade de inscritos
ALTER TABLE eventos 
ADD COLUMN quantidade_inscritos INTEGER DEFAULT 0;

-- Corrigindo nome da tabela de evento_voluntarios para participacoes_eventos
-- Atualiza a quantidade de inscritos para eventos existentes
UPDATE eventos e
SET quantidade_inscritos = (
  SELECT COUNT(*) 
  FROM participacoes_eventos pe 
  WHERE pe.evento_id = e.id
);

-- Cria função para atualizar quantidade de inscritos
CREATE OR REPLACE FUNCTION atualizar_quantidade_inscritos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementa quando um voluntário se inscreve
    UPDATE eventos 
    SET quantidade_inscritos = quantidade_inscritos + 1
    WHERE id = NEW.evento_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementa quando um voluntário cancela ou é removido
    UPDATE eventos 
    SET quantidade_inscritos = quantidade_inscritos - 1
    WHERE id = OLD.evento_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Cria trigger para INSERT
CREATE TRIGGER trigger_incrementar_inscritos
AFTER INSERT ON participacoes_eventos
FOR EACH ROW
EXECUTE FUNCTION atualizar_quantidade_inscritos();

-- Cria trigger para DELETE
CREATE TRIGGER trigger_decrementar_inscritos
AFTER DELETE ON participacoes_eventos
FOR EACH ROW
EXECUTE FUNCTION atualizar_quantidade_inscritos();
