"use client"

import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

type DashboardLayoutWrapperProps = {
  children: ReactNode
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const { isExpanded, setIsExpanded } = useSidebar()

  return (
    <div className={cn("flex flex-1 flex-col transition-all duration-300 min-h-screen min-w-0 overflow-x-hidden", isExpanded ? "md:ml-64" : "md:ml-20")}>
      <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-40">
        <h2 className="text-xl font-bold text-white">Amigos em Ação</h2>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
