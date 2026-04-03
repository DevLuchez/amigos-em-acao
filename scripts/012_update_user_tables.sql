-- Atualizar tabela de profiles para incluir telefone
alter table public.profiles 
add column if not exists telefone text;

-- Atualizar tabela de voluntarios para renomear coluna
alter table public.voluntarios 
rename column como_pode_ajudar to recursos;

-- Comentários para documentação
comment on column public.profiles.telefone is 'Telefone do usuário (gestor ou voluntário)';
comment on column public.voluntarios.recursos is 'Recursos que o voluntário pode oferecer (doações variadas, finanças, alimentos, vestimentas, participação em eventos)';
comment on column public.beneficiados.necessidade is 'Necessidade do beneficiado (alimentos, vestimentas, móveis, materiais escolares, ajuda financeira, ou descrição personalizada)';
