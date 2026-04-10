import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function VoluntarioPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Busca o tipo do profiles (mais confiável que user_metadata, que pode estar ausente)
  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single()

  if (profile?.tipo === "gestor") {
    redirect("/dashboard/gestor")
  }

  redirect("/dashboard/voluntario/solicitacoes")
}
