"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function loginAction(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let errorMessage = "Erro ao fazer login. Verifique seus dados e tente novamente."
    
    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "E-mail ou senha incorretos."
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "Por favor, confirme seu e-mail antes de fazer login."
    }
    
    return { error: errorMessage }
  }

  if (!data.user) {
    return { error: "Erro ao fazer login" }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", data.user.id)
    .single()

  console.log("[v0] Login bem-sucedido, user_id:", data.user.id)
  console.log("[v0] Profile encontrado:", profile)
  console.log("[v0] Erro ao buscar profile:", profileError)

  if (profileError || !profile) {
    return { error: "Erro ao buscar perfil do usuário" }
  }

  const tipoUsuario = profile.tipo

  console.log("[v0] Tipo de usuário:", tipoUsuario)

  // Redirecionar baseado no tipo de usuário
  if (tipoUsuario === "gestor") {
    redirect("/dashboard/gestor")
  } else if (tipoUsuario === "voluntario") {
    redirect("/dashboard/voluntario")
  } else {
    return { error: "Tipo de usuário inválido" }
  }
}
