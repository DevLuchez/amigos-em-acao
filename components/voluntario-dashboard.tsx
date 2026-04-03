"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Check, X, Eye, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getStatusEvento, formatEventoDateTime, podeSeInscrever } from "@/lib/utils/evento-utils"

type Evento = {
  id: string
  titulo: string
  descricao: string
  categoria: string
  data: string
  status: string
  participando?: boolean
  quantidade_minima_voluntarios: number
  quantidade_maxima_voluntarios: number | null
  voluntarios_inscritos?: number
}

const categorias = [
  { value: "doacoes_variadas", label: "Doações Variadas" },
  { value: "comida", label: "Comida" },
  { value: "vestimenta", label: "Vestimenta" },
  { value: "financeira", label: "Financeira" },
]

export default function VoluntarioDashboard({ userId }: { userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [userName, setUserName] = useState("")
  const [eventos, setEventos] = useState<Evento[]>([])
  const [meusEventos, setMeusEventos] = useState<Evento[]>([])
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [eventoToCancel, setEventoToCancel] = useState<string | null>(null)
  const [descricaoDialogOpen, setDescricaoDialogOpen] = useState(false)
  const [descricaoCompleta, setDescricaoCompleta] = useState("")
  const [authUserId, setAuthUserId] = useState<string | null>(null)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (user) {
      setAuthUserId(user.id)
      const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).single()
      if (profile) {
        setUserName(profile.nome)
      }
      // Carregar eventos após obter o usuário autenticado
      await loadEventosWithUserId(user.id)
    }
  }

  const loadEventos = async () => {
    if (authUserId) {
      await loadEventosWithUserId(authUserId)
    }
  }

  const loadEventosWithUserId = async (currentUserId: string) => {
    const supabase = createClient()
    const { data: eventosData } = await supabase.from("eventos").select("*").order("data", { ascending: true })
    const { data: participacoes } = await supabase
      .from("participacoes_eventos")
      .select("evento_id")
      .eq("voluntario_id", currentUserId)
    const eventosIds = participacoes?.map((p) => p.evento_id) || []
    if (eventosData) {
      const eventosFuturos = eventosData.filter((e) => getStatusEvento(e.data) === "proximo")
      const eventosComParticipacao = eventosFuturos.map((evento) => ({
        ...evento,
        voluntarios_inscritos: evento.quantidade_inscritos,
        participando: eventosIds.includes(evento.id),
      }))
      setEventos(eventosComParticipacao.filter((e) => !e.participando))
      setMeusEventos(eventosComParticipacao.filter((e) => e.participando))
    }
  }

  const handleParticipar = async (eventoId: string) => {
    if (!authUserId) {
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível identificar seu usuário. Faça login novamente.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }
    const evento = eventos.find((e) => e.id === eventoId)
    if (!evento) return
    const podeInscrever = podeSeInscrever(
      evento.data,
      evento.voluntarios_inscritos || 0,
      evento.quantidade_maxima_voluntarios,
    )
    if (!podeInscrever) {
      toast({
        title: "Evento lotado",
        description: "QTDE máxima já atingida. Te vejo no próximo evento!",
        variant: "destructive",
        duration: 5000,
      })
      return
    }
    const supabase = createClient()
    const { data, error } = await supabase
      .from("participacoes_eventos")
      .insert({
        evento_id: eventoId,
        voluntario_id: authUserId,
        confirmado: true,
      })
      .select()
    if (!error) {
      toast({
        title: "Participação confirmada!",
        description: "Você confirmou sua participação neste evento com sucesso.",
        duration: 3000,
      })
      await loadEventosWithUserId(authUserId)
    } else {

      let errorMessage = "Ocorreu um erro ao confirmar sua participação. Tente novamente."
      if (error.code === "23505") {
        errorMessage = "Você já confirmou participação neste evento."
      } else if (error.code === "23503") {
        errorMessage = "Evento não encontrado ou usuário inválido."
      } else if (error.message.includes("row-level security") || error.message.includes("policy")) {
        errorMessage = "Você não tem permissão para confirmar participação. Faça login novamente."
      }
      toast({
        title: "Erro ao confirmar participação",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const confirmCancelar = (eventoId: string) => {
    setEventoToCancel(eventoId)
    setCancelDialogOpen(true)
  }

  const handleCancelar = async () => {
    if (!eventoToCancel || !authUserId) return
    const supabase = createClient()
    const { error } = await supabase
      .from("participacoes_eventos")
      .delete()
      .eq("evento_id", eventoToCancel)
      .eq("voluntario_id", authUserId)
    if (!error) {
      toast({
        title: "Participação cancelada",
        description: "Sua participação foi cancelada com sucesso.",
        duration: 3000,
      })
      await loadEventosWithUserId(authUserId)
    }
    setCancelDialogOpen(false)
    setEventoToCancel(null)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const openDescricaoDialog = (descricao: string) => {
    setDescricaoCompleta(descricao)
    setDescricaoDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Cancelamento</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja cancelar sua participação neste evento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Não, manter participação
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelar} className="bg-red-500 text-white hover:bg-red-600">
              Sim, cancelar participação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={descricaoDialogOpen} onOpenChange={setDescricaoDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Descrição Completa</DialogTitle>
          </DialogHeader>
          <div className="text-zinc-300 whitespace-pre-wrap">{descricaoCompleta}</div>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-3xl font-bold text-white">Eventos</h1>
        <p className="text-zinc-400 mt-2">Participe dos eventos da ONG e faça a diferença</p>
      </div>

      <Tabs defaultValue="proximos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
          <TabsTrigger value="proximos">Próximos Eventos</TabsTrigger>
          <TabsTrigger value="meus">Meus Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="proximos">
          <div className="space-y-4">
            {eventos.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-8 text-center text-zinc-400">
                  Não há eventos disponíveis no momento
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {eventos.map((evento) => {
                  const { date, time } = formatEventoDateTime(evento.data)
                  const descricaoCurta = evento.descricao.length > 100
                  const podeInscrever = podeSeInscrever(
                    evento.data,
                    evento.voluntarios_inscritos || 0,
                    evento.quantidade_maxima_voluntarios,
                  )
                  const vagasRestantes = evento.quantidade_maxima_voluntarios
                    ? evento.quantidade_maxima_voluntarios - (evento.voluntarios_inscritos || 0)
                    : null
                  return (
                    <Card key={evento.id} className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-white">{evento.titulo}</CardTitle>
                        <CardDescription className="text-zinc-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {date} às {time}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-sm text-zinc-300">
                            {descricaoCurta ? `${evento.descricao.substring(0, 100)}...` : evento.descricao}
                          </p>
                          {descricaoCurta && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => openDescricaoDialog(evento.descricao)}
                              className="text-blue-400 hover:text-blue-300 p-0 h-auto mt-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver mais
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">
                          Categoria: {categorias.find((c) => c.value === evento.categoria)?.label}
                        </p>
                        <div className="text-sm text-zinc-400">
                          <p>
                            Inscritos: {evento.voluntarios_inscritos || 0} / {evento.quantidade_minima_voluntarios}{" "}
                          </p>
                          {vagasRestantes !== null && (
                            <p className="text-orange-400">
                              {vagasRestantes > 0 ? `${vagasRestantes} vaga(s) restante(s)` : "Evento lotado"}
                            </p>
                          )}
                        </div>
                        {podeInscrever ? (
                          <Button onClick={() => handleParticipar(evento.id)} className="w-full mt-4">
                            <Check className="mr-2 h-4 w-4" />
                            Confirmar Participação
                          </Button>
                        ) : (
                          <Button disabled className="w-full mt-4 bg-zinc-700 text-zinc-400">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Evento Lotado
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="meus">
          <div className="space-y-4">
            {meusEventos.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-8 text-center text-zinc-400">
                  Você ainda não confirmou participação em nenhum evento
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meusEventos.map((evento) => {
                  const { date, time } = formatEventoDateTime(evento.data)
                  const descricaoCurta = evento.descricao.length > 100
                  return (
                    <Card key={evento.id} className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-white">{evento.titulo}</CardTitle>
                        <CardDescription className="text-zinc-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {date} às {time}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-sm text-zinc-300">
                            {descricaoCurta ? `${evento.descricao.substring(0, 100)}...` : evento.descricao}
                          </p>
                          {descricaoCurta && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => openDescricaoDialog(evento.descricao)}
                              className="text-blue-400 hover:text-blue-300 p-0 h-auto mt-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver mais
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">
                          Categoria: {categorias.find((c) => c.value === evento.categoria)?.label}
                        </p>
                        <Button
                          onClick={() => confirmCancelar(evento.id)}
                          variant="destructive"
                          className="w-full mt-4"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar Participação
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
