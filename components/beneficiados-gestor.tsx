"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, User, MapPin, FileText } from "lucide-react"
import { useEffect, useState } from "react"

type Beneficiado = {
  id: string
  nome: string
  email: string
  cep: string
  necessidade: string
  descricao: string
  created_at: string
}

export default function BeneficiadosGestor() {
  const [beneficiados, setBeneficiados] = useState<Beneficiado[]>([])

  useEffect(() => {
    loadBeneficiados()
  }, [])

  const loadBeneficiados = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("beneficiados").select("*").order("created_at", { ascending: false })
    if (data) setBeneficiados(data)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pessoas Beneficiadas</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {beneficiados.map((beneficiado) => (
          <Card key={beneficiado.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                {beneficiado.nome}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Cadastrado em {new Date(beneficiado.created_at).toLocaleDateString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Mail className="h-4 w-4" />
                {beneficiado.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <MapPin className="h-4 w-4" />
                CEP: {beneficiado.cep}
              </div>
              <div className="pt-2">
                <p className="text-xs text-zinc-400 mb-1">Necessidade:</p>
                <p className="text-sm text-zinc-300">{beneficiado.necessidade}</p>
              </div>
              {beneficiado.descricao && (
                <div className="pt-2">
                  <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Descrição:
                  </p>
                  <p className="text-sm text-zinc-300 line-clamp-3">{beneficiado.descricao}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
