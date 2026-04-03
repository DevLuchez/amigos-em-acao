"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import EventosGestor from "./eventos-gestor"
import VoluntariosGestor from "./voluntarios-gestor"
import FeedbacksGestor from "./feedbacks-gestor"

export default function GestorDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).single()
        if (profile) {
          setUserName(profile.nome)
        }
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard - Gestor</h1>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Olá, {userName}</span>
            <Button onClick={handleLogout} variant="outline" className="border-zinc-700 bg-transparent">
              Sair
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="eventos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="voluntarios">Voluntários</TabsTrigger>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
          </TabsList>

          <TabsContent value="eventos">
            <EventosGestor />
          </TabsContent>

          <TabsContent value="voluntarios">
            <VoluntariosGestor />
          </TabsContent>

          <TabsContent value="feedbacks">
            <FeedbacksGestor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
