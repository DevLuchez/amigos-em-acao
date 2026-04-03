import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/dashboard-sidebar"
import VoluntariosGestor from "@/components/voluntarios-gestor"
import { SidebarProvider } from "@/contexts/sidebar-context"
import DashboardLayoutWrapper from "@/components/dashboard-layout-wrapper"

export default async function VoluntariosPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const tipo = user.user_metadata?.tipo

  if (tipo !== "gestor") {
    redirect("/dashboard/voluntario")
  }

  const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).single()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-black text-white">
        <DashboardSidebar userType="gestor" userName={profile?.nome || "Gestor"} />

        <DashboardLayoutWrapper>
          <VoluntariosGestor />
        </DashboardLayoutWrapper>
      </div>
    </SidebarProvider>
  )
}
