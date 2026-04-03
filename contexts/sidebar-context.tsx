"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type SidebarContextType = {
  isExpanded: boolean
  setIsExpanded: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
