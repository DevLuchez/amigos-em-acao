-- Tabela de perfis de usuários (gestor e voluntário)
-- Referencia auth.users com cascade delete
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  telefone text not null,
  tipo text not null check (tipo in ('gestor', 'voluntario')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Políticas RLS para profiles
create policy "Usuários podem ver seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem inserir seu próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Gestores podem ver todos os perfis"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo = 'gestor'
    )
  );
