-- Função para criar perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, telefone, tipo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', 'Usuário'),
    coalesce(new.raw_user_meta_data ->> 'telefone', ''),
    coalesce(new.raw_user_meta_data ->> 'tipo', 'voluntario')
  )
  on conflict (id) do nothing;

  -- Se for voluntário, criar registro na tabela voluntarios
  if coalesce(new.raw_user_meta_data ->> 'tipo', 'voluntario') = 'voluntario' then
    insert into public.voluntarios (id, como_pode_ajudar)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'como_pode_ajudar', '')
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- Criar trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
