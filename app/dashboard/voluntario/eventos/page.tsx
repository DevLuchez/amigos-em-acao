import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/dashboard-sidebar"
import VoluntarioDashboard from "@/components/voluntario-dashboard"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { SidebarProvider } from "@/contexts/sidebar-context"
import DashboardLayoutWrapper from "@/components/dashboard-layout-wrapper"

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-zinc-400">Carregando eventos...</p>
      </div>
    </div>
  )
}

export default async function VoluntarioEventosPage() {
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

  const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).single()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-black text-white overflow-x-hidden">
        <DashboardSidebar userType="voluntario" userName={profile?.nome || "Voluntário"} />

        <DashboardLayoutWrapper>
          <Suspense fallback={<LoadingState />}>
            <VoluntarioDashboard />
          </Suspense>
        </DashboardLayoutWrapper>
      </div>
    </SidebarProvider>
  )
}
