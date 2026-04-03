-- Criação da tabela de solicitações de ajuda
CREATE TABLE IF NOT EXISTS public.solicitacoes_ajuda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiado_id UUID NOT NULL REFERENCES public.beneficiados(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('nova', 'aprovada', 'em_andamento', 'concluida', 'reprovada')),
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
  voluntario_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_agendada TIMESTAMP WITH TIME ZONE,
  justificativa_reprovacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON public.solicitacoes_ajuda(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_beneficiado ON public.solicitacoes_ajuda(beneficiado_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_voluntario ON public.solicitacoes_ajuda(voluntario_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_created_at ON public.solicitacoes_ajuda(created_at DESC);

-- Function para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_solicitacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_solicitacoes_updated_at ON public.solicitacoes_ajuda;
CREATE TRIGGER trigger_update_solicitacoes_updated_at
  BEFORE UPDATE ON public.solicitacoes_ajuda
  FOR EACH ROW
  EXECUTE FUNCTION update_solicitacoes_updated_at();

-- Habilitar RLS
ALTER TABLE public.solicitacoes_ajuda ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para gestores (podem ver e fazer tudo)
CREATE POLICY solicitacoes_gestores_all ON public.solicitacoes_ajuda
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tipo = 'gestor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tipo = 'gestor'
    )
  );

-- Políticas para voluntários (podem ver aprovadas e em_andamento)
CREATE POLICY solicitacoes_voluntarios_select ON public.solicitacoes_ajuda
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tipo = 'voluntario'
    )
    AND status IN ('aprovada', 'em_andamento', 'concluida')
  );

-- Políticas para voluntários (podem atualizar apenas suas solicitações)
CREATE POLICY solicitacoes_voluntarios_update ON public.solicitacoes_ajuda
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tipo = 'voluntario'
    )
    AND (voluntario_id = auth.uid() OR voluntario_id IS NULL)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tipo = 'voluntario'
    )
    AND (voluntario_id = auth.uid() OR status = 'em_andamento')
  );
