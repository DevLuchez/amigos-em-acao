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

  const tipo = user.user_metadata?.tipo

  if (tipo === "gestor") {
    redirect("/dashboard/gestor")
  }

  redirect("/dashboard/voluntario/solicitacoes")
}
