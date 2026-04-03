"use client"

import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type DashboardLayoutWrapperProps = {
  children: ReactNode
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const { isExpanded } = useSidebar()

  return (
    <main className={cn("flex-1 p-8 transition-all duration-300", isExpanded ? "ml-64" : "ml-20")}>{children}</main>
  )
}
