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

-- Remover políticas antigas que causam recursão
drop policy if exists "Usuários podem ver seu próprio perfil" on public.profiles;
drop policy if exists "Usuários podem inserir seu próprio perfil" on public.profiles;
drop policy if exists "Usuários podem atualizar seu próprio perfil" on public.profiles;
drop policy if exists "Gestores podem ver todos os perfis" on public.profiles;

-- Criar políticas RLS simplificadas sem recursão
create policy "Permitir leitura do próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Permitir inserção do próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Permitir atualização do próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Política para gestores usando auth.jwt() ao invés de subquery recursivo
create policy "Gestores podem ver todos os perfis"
  on public.profiles for select
  using (
    (select raw_user_meta_data->>'tipo' from auth.users where id = auth.uid()) = 'gestor'
  );
