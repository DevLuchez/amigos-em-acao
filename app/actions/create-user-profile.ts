"use server"

import { createClient } from "@supabase/supabase-js"

export async function createUserProfile(userData: {
  id: string
  nome: string
  email: string
  telefone: string
  tipo: "gestor" | "voluntario"
}) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Criar registro em profiles
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      telefone: userData.telefone,
      tipo: userData.tipo,
    })

    if (profileError) {
      throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    }

    // Se for voluntário, criar registro em voluntarios
    if (userData.tipo === "voluntario") {
      const { error: voluntarioError } = await supabaseAdmin.from("voluntarios").insert({
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone,
      })

      if (voluntarioError) {
        throw new Error(`Erro ao criar registro de voluntário: ${voluntarioError.message}`)
      }
    }

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao criar perfil"
    return { success: false, error: message }
  }
}
