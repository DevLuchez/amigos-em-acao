-- =============================================
-- Script 047: Fotos de Eventos Realizados
-- RESET COMPLETO: Remove tudo e recria do zero
-- =============================================

-- ========== LIMPEZA ==========

-- 1. Remover policies de Storage (precisa dropar antes de deletar o bucket)
DROP POLICY IF EXISTS "Fotos de eventos publicas storage" ON storage.objects;
DROP POLICY IF EXISTS "Gestores podem fazer upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Gestores podem deletar fotos storage" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados podem fazer upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar fotos" ON storage.objects;
DROP POLICY IF EXISTS "Public read evento fotos" ON storage.objects;
DROP POLICY IF EXISTS "Fotos de eventos publicas" ON storage.objects;

-- 2. Se houver fotos já enviadas, delete-as manualmente pelo painel Storage do Supabase antes de rodar isto.
-- (O Supabase não permite DELETE direto em storage.objects via SQL)

-- 3. Remover o bucket
DELETE FROM storage.buckets WHERE id = 'evento-fotos';

-- 4. Remover policies da tabela evento_fotos
DROP POLICY IF EXISTS "Fotos de eventos sao publicas para leitura" ON public.evento_fotos;
DROP POLICY IF EXISTS "Gestores podem inserir fotos" ON public.evento_fotos;
DROP POLICY IF EXISTS "Gestores podem deletar fotos" ON public.evento_fotos;
DROP POLICY IF EXISTS "Fotos de eventos são públicas para leitura" ON public.evento_fotos;

-- 5. Remover a tabela
DROP TABLE IF EXISTS public.evento_fotos;

-- ========== RECRIAÇÃO ==========

-- 1. Tabela para armazenar metadados das fotos
CREATE TABLE public.evento_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public.evento_fotos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS para evento_fotos
CREATE POLICY "Fotos de eventos sao publicas para leitura"
  ON public.evento_fotos FOR SELECT
  USING (true);

CREATE POLICY "Gestores podem inserir fotos"
  ON public.evento_fotos FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'gestor')
  );

CREATE POLICY "Gestores podem deletar fotos"
  ON public.evento_fotos FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'gestor')
  );

-- 4. Criar bucket de Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evento-fotos',
  'evento-fotos',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

-- 5. Políticas de Storage
CREATE POLICY "Fotos de eventos publicas storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'evento-fotos');

CREATE POLICY "Gestores podem fazer upload de fotos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evento-fotos'
    AND (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'gestor'
  );

CREATE POLICY "Gestores podem deletar fotos storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evento-fotos'
    AND (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'gestor'
  );
