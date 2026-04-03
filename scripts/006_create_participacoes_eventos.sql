-- Tabela de participações em eventos
create table if not exists public.participacoes_eventos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  voluntario_id uuid not null references public.profiles(id) on delete cascade,
  confirmado boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(evento_id, voluntario_id)
);

-- Habilitar RLS
alter table public.participacoes_eventos enable row level security;

-- Políticas RLS para participacoes_eventos
-- Voluntários podem ver suas próprias participações
create policy "Voluntários podem ver suas próprias participações"
  on public.participacoes_eventos for select
  using (auth.uid() = voluntario_id);

-- Voluntários podem confirmar participação
create policy "Voluntários podem confirmar participação"
  on public.participacoes_eventos for insert
  with check (auth.uid() = voluntario_id);

-- Voluntários podem cancelar participação
create policy "Voluntários podem cancelar participação"
  on public.participacoes_eventos for delete
  using (auth.uid() = voluntario_id);

-- Gestores podem ver todas as participações
create policy "Gestores podem ver todas as participações"
  on public.participacoes_eventos for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo = 'gestor'
    )
  );
