-- Remover trigger antigo se existir
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Função para criar perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, telefone, tipo)
  values (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'tipo'
  );
  
  -- Se for voluntário, criar registro na tabela voluntarios
  if new.raw_user_meta_data->>'tipo' = 'voluntario' then
    insert into public.voluntarios (user_id, como_pode_ajudar)
    values (
      new.id,
      new.raw_user_meta_data->>'como_pode_ajudar'
    );
  end if;
  
  return new;
end;
$$;

-- Trigger para executar a função após inserção de novo usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
