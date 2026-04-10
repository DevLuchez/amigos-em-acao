import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/dashboard-sidebar"
import ConfiguracoesPerfil from "@/components/configuracoes-perfil"
import { SidebarProvider } from "@/contexts/sidebar-context"
import DashboardLayoutWrapper from "@/components/dashboard-layout-wrapper"

export default async function VoluntarioConfiguracoesPage() {
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

  const { data: profile } = await supabase.from("profiles").select("nome, email, telefone").eq("id", user.id).single()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-black text-white overflow-x-hidden">
        <DashboardSidebar userType="voluntario" userName={profile?.nome || "Voluntário"} />

        <DashboardLayoutWrapper>
          <ConfiguracoesPerfil userId={user.id} userType="voluntario" initialProfile={profile} />
        </DashboardLayoutWrapper>
      </div>
    </SidebarProvider>
  )
}
