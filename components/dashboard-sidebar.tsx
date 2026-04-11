"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import {
  Calendar,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  HandHeart,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import SupportDialog from "@/components/support-dialog"

type SidebarProps = {
  userType: "gestor" | "voluntario"
  userName: string
}

export default function DashboardSidebar({ userType, userName }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isExpanded, setIsExpanded } = useSidebar()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  const gestorLinks = [
    { href: "/dashboard/gestor", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/dashboard/gestor/solicitacoes", label: "Solicitações", icon: HandHeart },
    { href: "/dashboard/gestor/eventos", label: "Eventos", icon: Calendar },
    { href: "/dashboard/gestor/voluntarios", label: "Usuários", icon: Users },
    { href: "/dashboard/gestor/feedbacks", label: "Feedbacks", icon: MessageSquare },
  ]

  const voluntarioLinks = [
    { href: "/dashboard/voluntario/solicitacoes", label: "Solicitações", icon: HandHeart },
    { href: "/dashboard/voluntario/eventos", label: "Eventos", icon: Calendar },
  ]

  const links = userType === "gestor" ? gestorLinks : voluntarioLinks

  return (
    <>
      {/* Mobile Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
      <div
        className={cn(
          "fixed left-0 top-0 flex h-screen flex-col border-r border-zinc-800 bg-zinc-900 transition-all duration-300 z-50",
          isExpanded ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-20 md:translate-x-0",
        )}
      >
      {/* Header */}
      <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
        {isExpanded && (
          <div>
            <h2 className="text-xl font-bold text-white">Amigos em Ação</h2>
            <p className="text-sm text-zinc-400 mt-1">{userType === "gestor" ? "Gestor" : "Voluntário"}</p>
          </div>
        )}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* User Info */}
      {isExpanded && (
        <div className="border-b border-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Olá,</p>
          <p className="font-medium text-white truncate">{userName}</p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-white text-black" : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                !isExpanded && "justify-center",
              )}
              title={!isExpanded ? link.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-zinc-800 p-4 space-y-2">
        {/* Suporte */}
        <SupportDialog
          variant="icon"
          userName={userName}
          isExpanded={isExpanded}
        />
        <Link
          href={`/dashboard/${userType}/configuracoes`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors w-full",
            pathname.includes("/configuracoes")
              ? "bg-white text-black"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
            !isExpanded && "justify-center",
          )}
          title={!isExpanded ? "Configurações" : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {isExpanded && "Configurações"}
        </Link>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full gap-3 text-zinc-400 hover:bg-zinc-800 hover:text-white",
            isExpanded ? "justify-start" : "justify-center",
          )}
          title={!isExpanded ? "Sair" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isExpanded && "Sair"}
        </Button>
      </div>
    </div>
    </>
  )
}
