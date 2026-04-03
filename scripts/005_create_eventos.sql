-- Tabela de eventos
create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null,
  categoria text not null check (categoria in ('doacoes_variadas', 'comida', 'vestimenta', 'financeira')),
  data timestamp with time zone not null,
  status text not null default 'proximo' check (status in ('proximo', 'realizado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.eventos enable row level security;

-- Políticas RLS para eventos
-- Todos podem ver eventos
create policy "Todos podem ver eventos"
  on public.eventos for select
  using (true);

-- Apenas gestores podem criar, atualizar e deletar eventos
create policy "Gestores podem criar eventos"
  on public.eventos for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo = 'gestor'
    )
  );

create policy "Gestores podem atualizar eventos"
  on public.eventos for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo = 'gestor'
    )
  );

create policy "Gestores podem deletar eventos"
  on public.eventos for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo = 'gestor'
    )
  );
