"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VoluntariosGestor from "@/components/voluntarios-gestor"
import GestoresGestor from "@/components/gestores-gestor"

export default function UsuariosGestorTabs({ currentUserId }: { currentUserId: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Usuários</h1>
        <p className="text-zinc-400 mt-2">Gerencie voluntários e gestores do sistema</p>
      </div>

      <Tabs defaultValue="voluntarios" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="voluntarios">Voluntários</TabsTrigger>
          <TabsTrigger value="gestores">Gestores</TabsTrigger>
        </TabsList>

        <TabsContent value="voluntarios" className="mt-6">
          <VoluntariosGestor />
        </TabsContent>

        <TabsContent value="gestores" className="mt-6">
          <GestoresGestor currentUserId={currentUserId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
