"use server"

import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Remove um usuário completamente: voluntarios -> profiles -> auth.users
 * Usa hard delete (shouldSoftDelete: false) para liberar o email.
 */
async function hardDeleteUser(supabaseAdmin: ReturnType<typeof getAdminClient>, userId: string) {
  // 1. Limpa tabelas dependentes manualmente (caso CASCADE não esteja configurado)
  await supabaseAdmin.from("participacoes_eventos").delete().eq("voluntario_id", userId)
  await supabaseAdmin.from("voluntarios").delete().eq("id", userId)
  await supabaseAdmin.from("profiles").delete().eq("id", userId)

  // 2. Hard delete do auth.users — libera o email para recadastro
  // O segundo parâmetro (false) desativa soft delete, removendo o registro completamente
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId, false)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function deleteUser(userIdToDelete: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single()

  if (requesterProfile?.tipo !== "gestor") {
    return { success: false, error: "Apenas gestores podem excluir usuários" }
  }

  if (user.id === userIdToDelete) {
    return { success: false, error: "Não é possível excluir sua própria conta por aqui. Use as configurações." }
  }

  return hardDeleteUser(getAdminClient(), userIdToDelete)
}

export async function deleteOwnAccount(userId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return { success: false, error: "Não autenticado" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single()

  if (profile?.tipo === "gestor") {
    const supabaseAdmin = getAdminClient()

    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("tipo", "gestor")

    if ((count ?? 0) <= 1) {
      return {
        success: false,
        error: "Não é possível excluir sua conta. Deve haver pelo menos 1 gestor no sistema.",
      }
    }
  }

  return hardDeleteUser(getAdminClient(), userId)
}
