-- Tabela de beneficiados (não têm conta de usuário)
create table if not exists public.beneficiados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  email text not null,
  tamanho_familiar integer not null,
  necessidade text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.beneficiados enable row level security;

-- Políticas RLS para beneficiados
-- Apenas gestores podem ver beneficiados
create policy "Gestores podem ver todos os beneficiados"
  on public.beneficiados for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo = 'gestor'
    )
  );

-- Permitir inserção pública (formulário da landing page)
create policy "Qualquer um pode se cadastrar como beneficiado"
  on public.beneficiados for insert
  with check (true);
