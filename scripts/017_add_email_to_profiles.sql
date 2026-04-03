-- Adiciona coluna email na tabela profiles
-- Isso permite armazenar o email de gestores e voluntários

-- Adicionar coluna email
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Adicionar constraint de email único
ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Adicionar constraint de email obrigatório (após popular dados existentes)
-- Comentado por enquanto para não quebrar dados existentes
-- ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Atualizar emails existentes de auth.users para profiles (se houver)
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

COMMENT ON COLUMN profiles.email IS 'Email do usuário (sincronizado com auth.users)';
