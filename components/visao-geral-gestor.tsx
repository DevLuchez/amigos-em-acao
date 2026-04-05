"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Users, MessageSquare, Loader2, AlertTriangle, CheckCircle2, Heart } from "lucide-react"
import { getStatusEvento, getStatusViabilidade, formatEventoDateTime } from "@/lib/utils/evento-utils"

type Stats = {
  pessoasAjudadas: number
  eventosRealizados: number
  voluntarios: number
  feedbacks: number
}

type EventoViabilidade = {
  id: string
  titulo: string
  data: string
  inscritos: number
  quantidade_minima: number
  status: "inviavel" | "viavel" | "lotado"
}

export default function VisaoGeralGestor() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    pessoasAjudadas: 0,
    eventosRealizados: 0,
    voluntarios: 0,
    feedbacks: 0,
  })
  const [eventosViabilidade, setEventosViabilidade] = useState<EventoViabilidade[]>([])

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      const supabase = createClient()

      const [eventosData, voluntariosRes, feedbacksRes, solicitacoesRes] = await Promise.all([
        supabase.from("eventos").select("data"),
        supabase.from("voluntarios").select("*", { count: "exact", head: true }),
        supabase.from("feedbacks").select("*", { count: "exact", head: true }),
        supabase.from("solicitacoes_ajuda").select("*", { count: "exact", head: true }).eq("status", "concluida"),
      ])

      const eventosRealizados = eventosData.data
        ? eventosData.data.filter((e) => getStatusEvento(e.data) === "realizado").length
        : 0

      setStats({
        pessoasAjudadas: solicitacoesRes.count || 0,
        eventosRealizados,
        voluntarios: voluntariosRes.count || 0,
        feedbacks: feedbacksRes.count || 0,
      })

      const { data: eventosFuturos } = await supabase
        .from("eventos")
        .select("id, titulo, data, quantidade_minima_voluntarios, quantidade_maxima_voluntarios, quantidade_inscritos")
        .gte("data", new Date().toISOString())
        .order("data", { ascending: true })

      if (eventosFuturos) {
        const eventosComStatus = eventosFuturos.map((evento) => {
          const status = getStatusViabilidade(
            evento.quantidade_inscritos,
            evento.quantidade_minima_voluntarios,
            evento.quantidade_maxima_voluntarios,
          )

          return {
            id: evento.id,
            titulo: evento.titulo,
            data: evento.data,
            inscritos: evento.quantidade_inscritos,
            quantidade_minima: evento.quantidade_minima_voluntarios,
            status,
          }
        })

        setEventosViabilidade(eventosComStatus)
      }

      setLoading(false)
    }

    loadStats()
  }, [])

  const statCards = [
    {
      title: "Pessoas Ajudadas",
      value: stats.pessoasAjudadas,
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Eventos Realizados",
      value: stats.eventosRealizados,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Voluntários Cadastrados",
      value: stats.voluntarios,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Feedbacks Recebidos",
      value: stats.feedbacks,
      icon: MessageSquare,
      color: "text-purple-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Status de Viabilidade dos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Evento</TableHead>
                <TableHead className="text-zinc-400">Data Agendada</TableHead>
                <TableHead className="text-zinc-400 text-center">Inscritos / Mínimo</TableHead>
                <TableHead className="text-zinc-400 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventosViabilidade.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={4} className="text-center text-zinc-400 py-6">
                    Não há eventos futuros agendados no momento.
                  </TableCell>
                </TableRow>
              ) : (
                eventosViabilidade.map((evento) => {
                  const { date } = formatEventoDateTime(evento.data)
                  return (
                    <TableRow key={evento.id} className="border-zinc-800">
                      <TableCell className="text-white font-medium">{evento.titulo}</TableCell>
                      <TableCell className="text-zinc-300">{date}</TableCell>
                      <TableCell className="text-zinc-300 text-center">
                        {evento.inscritos} / {evento.quantidade_minima}
                      </TableCell>
                      <TableCell className="text-center">
                        {evento.status === "viavel" ? (
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Viável
                          </span>
                        ) : evento.status === "lotado" ? (
                          <span className="inline-flex items-center gap-1 text-blue-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Lotado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-orange-400">
                            <AlertTriangle className="h-4 w-4" />
                            Inviável
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
