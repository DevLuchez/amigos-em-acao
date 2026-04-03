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
    console.log("[v0] Criando profile com service role...")

    // Criar registro em profiles
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      telefone: userData.telefone,
      tipo: userData.tipo,
    })

    if (profileError) {
      console.error("[v0] Erro ao criar profile:", profileError)
      throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    }

    console.log("[v0] Profile criado com sucesso")

    // Se for voluntário, criar registro em voluntarios
    if (userData.tipo === "voluntario") {
      console.log("[v0] Criando registro de voluntário...")

      const { error: voluntarioError } = await supabaseAdmin.from("voluntarios").insert({
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone,
      })

      if (voluntarioError) {
        console.error("[v0] Erro ao criar voluntário:", voluntarioError)
        throw new Error(`Erro ao criar registro de voluntário: ${voluntarioError.message}`)
      }

      console.log("[v0] Registro de voluntário criado com sucesso")
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Erro na criação do perfil:", error)
    return { success: false, error: error.message }
  }
}
