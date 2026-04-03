-- Remove políticas e função problemáticas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Gestores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Gestores podem atualizar qualquer perfil" ON profiles;
DROP FUNCTION IF EXISTS is_gestor();

-- Cria políticas RLS simples e funcionais
-- Permite que todos os usuários autenticados leiam profiles (necessário para o sistema funcionar)
CREATE POLICY "Usuários autenticados podem ler profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Permite que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permite que usuários deletem apenas seu próprio perfil
CREATE POLICY "Usuários podem deletar seu próprio perfil"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- O INSERT é tratado pelo trigger, então não precisa de política específica
CREATE POLICY "Sistema pode inserir profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
