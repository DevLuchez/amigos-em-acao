import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/contexts/sidebar-context"
import DashboardLayoutWrapper from "@/components/dashboard-layout-wrapper"
import FeedbacksGestor from "@/components/feedbacks-gestor"

export default async function FeedbacksPage() {
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
      <div className="flex min-h-screen bg-black text-white overflow-x-hidden">
        <DashboardSidebar userType="gestor" userName={profile?.nome || "Gestor"} />

        <DashboardLayoutWrapper>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Feedbacks</h1>
            <p className="text-zinc-400 mt-2">Gerencie os feedbacks recebidos da landing page</p>
          </div>

          <FeedbacksGestor />
        </DashboardLayoutWrapper>
      </div>
    </SidebarProvider>
  )
}
