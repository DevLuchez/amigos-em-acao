import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/dashboard-sidebar"
import VisaoGeralGestor from "@/components/visao-geral-gestor"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { SidebarProvider } from "@/contexts/sidebar-context"
import DashboardLayoutWrapper from "@/components/dashboard-layout-wrapper"

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-zinc-400">Carregando dashboard...</p>
      </div>
    </div>
  )
}

export default async function GestorPage() {
  console.log("[v0] Dashboard Gestor - Iniciando verificação de autenticação")

  const supabase = await createClient()
  console.log("[v0] Dashboard Gestor - Cliente Supabase criado")

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log("[v0] Dashboard Gestor - Resultado getUser:", {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userMetadata: user?.user_metadata,
    error: error?.message,
  })

  if (error || !user) {
    console.log("[v0] Dashboard Gestor - Sem usuário ou erro, redirecionando para login")
    redirect("/auth/login")
  }

  const tipo = user.user_metadata?.tipo
  console.log("[v0] Dashboard Gestor - Tipo de usuário:", tipo)

  if (tipo !== "gestor") {
    console.log("[v0] Dashboard Gestor - Tipo não é gestor, redirecionando para voluntário")
    redirect("/dashboard/voluntario")
  }

  console.log("[v0] Dashboard Gestor - Autenticação OK, carregando dashboard")

  const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).single()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-black text-white">
        <DashboardSidebar userType="gestor" userName={profile?.nome || "Gestor"} />

        <DashboardLayoutWrapper>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Visão Geral</h1>
            <p className="text-zinc-400 mt-2">Acompanhe as estatísticas e métricas da ONG</p>
          </div>

          <Suspense fallback={<LoadingState />}>
            <VisaoGeralGestor />
          </Suspense>
        </DashboardLayoutWrapper>
      </div>
    </SidebarProvider>
  )
}
