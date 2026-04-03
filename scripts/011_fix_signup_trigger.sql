-- Remover trigger e função antigos
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Função para criar perfil automaticamente após signup
-- Adicionando tratamento de erros e usando SECURITY DEFINER para bypass RLS
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_tipo text;
begin
  -- Extrair o tipo do usuário
  user_tipo := new.raw_user_meta_data->>'tipo';
  
  -- Inserir perfil (RLS será bypassado devido a SECURITY DEFINER)
  insert into public.profiles (id, nome, telefone, tipo)
  values (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'telefone',
    coalesce(user_tipo, 'voluntario')
  );
  
  -- Se for voluntário, criar registro na tabela voluntarios
  if user_tipo = 'voluntario' then
    insert into public.voluntarios (id, como_pode_ajudar)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'como_pode_ajudar', 'participacao-eventos')
    );
  end if;
  
  return new;
exception
  when others then
    -- Log do erro (aparecerá nos logs do Supabase)
    raise warning 'Erro ao criar perfil para usuário %: %', new.id, SQLERRM;
    return new;
end;
$$;

-- Trigger para executar a função após inserção de novo usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Adicionar política para permitir inserção durante signup
-- Permitindo inserção na tabela profiles durante o signup
drop policy if exists "Permitir inserção durante signup" on public.profiles;
create policy "Permitir inserção durante signup"
  on public.profiles for insert
  with check (true);

-- Permitindo inserção na tabela voluntarios durante o signup  
drop policy if exists "Permitir inserção durante signup" on public.voluntarios;
create policy "Permitir inserção durante signup"
  on public.voluntarios for insert
  with check (true);
