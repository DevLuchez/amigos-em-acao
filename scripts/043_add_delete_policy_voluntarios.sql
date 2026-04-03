-- Adicionar política RLS para permitir que gestores deletem voluntários

-- Política para deletar voluntários (apenas gestores)
CREATE POLICY "Gestores podem deletar voluntários"
  ON public.voluntarios FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'gestor'
    )
  );

-- Comentário
COMMENT ON POLICY "Gestores podem deletar voluntários" ON public.voluntarios 
IS 'Permite que usuários do tipo gestor possam deletar registros de voluntários';
