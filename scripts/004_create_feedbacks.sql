-- Tabela de feedbacks
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  mensagem text not null,
  anonimo boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.feedbacks enable row level security;

-- Políticas RLS para feedbacks
-- Gestores podem ver todos os feedbacks
create policy "Gestores podem ver todos os feedbacks"
  on public.feedbacks for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and tipo = 'gestor'
    )
  );

-- Usuários logados podem ver seus próprios feedbacks
create policy "Usuários podem ver seus próprios feedbacks"
  on public.feedbacks for select
  using (auth.uid() = user_id);

-- Qualquer um pode inserir feedback (anônimo ou logado)
create policy "Qualquer um pode enviar feedback"
  on public.feedbacks for insert
  with check (true);
