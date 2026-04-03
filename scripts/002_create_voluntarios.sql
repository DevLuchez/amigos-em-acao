-- Tabela de informações específicas de voluntários
create table if not exists public.voluntarios (
  id uuid primary key references public.profiles(id) on delete cascade,
  como_pode_ajudar text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.voluntarios enable row level security;

-- Políticas RLS para voluntarios
create policy "Voluntários podem ver suas próprias informações"
  on public.voluntarios for select
  using (auth.uid() = id);

create policy "Voluntários podem inserir suas próprias informações"
  on public.voluntarios for insert
  with check (auth.uid() = id);

create policy "Voluntários podem atualizar suas próprias informações"
  on public.voluntarios for update
  using (auth.uid() = id);

create policy "Gestores podem ver todos os voluntários"
  on public.voluntarios for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo = 'gestor'
    )
  );
