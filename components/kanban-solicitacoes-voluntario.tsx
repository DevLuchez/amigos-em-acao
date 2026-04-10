"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Loader2, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react'
import { useEffect, useState } from "react"

type Beneficiado = {
  id: string
  nome: string
  email: string
  telefone: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  necessidade: string
  descricao: string
}

type Solicitacao = {
  id: string
  beneficiado_id: string
  status: "nova" | "aprovada" | "em_andamento" | "concluida" | "reprovada"
  prioridade: "baixa" | "media" | "alta"
  voluntario_id: string | null
  data_agendada: string | null
  created_at: string
  updated_at: string
  beneficiado: Beneficiado
  voluntario?: { nome: string } | null
}

type KanbanVoluntarioProps = {
  userId: string
}

export default function KanbanSolicitacoesVoluntario({ userId }: KanbanVoluntarioProps) {
  const { toast } = useToast()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [assumirDialogOpen, setAssumirDialogOpen] = useState(false)
  const [agendarDialogOpen, setAgendarDialogOpen] = useState(false)
  const [concluirDialogOpen, setConcluirDialogOpen] = useState(false)
  const [dataAgendada, setDataAgendada] = useState("")
  const [horaAgendada, setHoraAgendada] = useState("")

  useEffect(() => {
    loadSolicitacoes()
  }, [])

  const loadSolicitacoes = async () => {
    setLoading(true)
    const supabase = createClient()

    // Voluntários veem apenas: aprovadas, em_andamento (suas), concluidas
    const { data } = await supabase
      .from("solicitacoes_ajuda")
      .select(
        `
        *,
        beneficiado:beneficiados(id, nome, email, telefone, endereco, bairro, cidade, necessidade, descricao),
        voluntario:profiles!solicitacoes_ajuda_voluntario_id_fkey(nome)
      `,
      )
      .in("status", ["aprovada", "em_andamento", "concluida"])
      .order("created_at", { ascending: false })

    if (data) {
      setSolicitacoes(data as unknown as Solicitacao[])
    }
    setLoading(false)
  }

  const handleAssumirResponsabilidade = async () => {
    if (!selectedSolicitacao) return

    const supabase = createClient()
    const { error } = await supabase
      .from("solicitacoes_ajuda")
      .update({
        status: "em_andamento",
        voluntario_id: userId,
      })
      .eq("id", selectedSolicitacao.id)

    if (!error) {
      toast({
        title: "Responsabilidade assumida",
        description: "Você assumiu a responsabilidade desta solicitação. Agende a visita agora.",
        duration: 3000,
      })
      loadSolicitacoes()
      setAssumirDialogOpen(false)
      setDetailsDialogOpen(false)
    } else {
      toast({
        title: "Erro ao assumir responsabilidade",
        description: "Não foi possível assumir esta solicitação. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleAgendarVisita = async () => {
    if (!selectedSolicitacao || !dataAgendada || !horaAgendada) {
      toast({
        title: "Preencha data e hora",
        description: "Por favor, informe a data e hora da visita.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Monta o datetime com o offset do fuso horário local para evitar conversão UTC incorreta
    const localOffset = new Date().getTimezoneOffset() // ex: 180 para UTC-3
    const sign = localOffset >= 0 ? "-" : "+"
    const absOffset = Math.abs(localOffset)
    const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0")
    const offsetMinutes = String(absOffset % 60).padStart(2, "0")
    const dataHora = `${dataAgendada}T${horaAgendada}:00${sign}${offsetHours}:${offsetMinutes}`

    // Validação: impede agendamento no passado (além do min no input, cobre digitação manual)
    if (new Date(dataHora) <= new Date()) {
      toast({
        title: "Data inválida",
        description: "A visita deve ser agendada para uma data e hora futuras.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    const supabase = createClient()
    const { error } = await supabase
      .from("solicitacoes_ajuda")
      .update({ data_agendada: dataHora })
      .eq("id", selectedSolicitacao.id)

    if (!error) {
      toast({
        title: "Visita agendada",
        description: "A data da visita foi registrada com sucesso.",
        duration: 3000,
      })
      loadSolicitacoes()
      setAgendarDialogOpen(false)
      setDetailsDialogOpen(false)
      setDataAgendada("")
      setHoraAgendada("")
    }
  }

  const handleConcluir = async () => {
    if (!selectedSolicitacao) return

    const supabase = createClient()
    const { error } = await supabase
      .from("solicitacoes_ajuda")
      .update({ status: "concluida" })
      .eq("id", selectedSolicitacao.id)

    if (!error) {
      toast({
        title: "Solicitação concluída",
        description: "O atendimento foi marcado como concluído com sucesso.",
        duration: 3000,
      })
      loadSolicitacoes()
      setConcluirDialogOpen(false)
      setDetailsDialogOpen(false)
    }
  }

  const openDetails = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao)
    setDetailsDialogOpen(true)
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "destructive"
      case "media":
        return "default"
      case "baixa":
        return "secondary"
      default:
        return "default"
    }
  }

  const getPrioridadeLabel = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "Alta"
      case "media":
        return "Média"
      case "baixa":
        return "Baixa"
      default:
        return prioridade
    }
  }

  // Filtrar solicitações por status e responsabilidade
  const aprovadas = solicitacoes.filter((s) => s.status === "aprovada")
  const minhasAssumidas = solicitacoes.filter((s) => s.status === "em_andamento" && s.voluntario_id === userId && !s.data_agendada)
  const minhasAgendadas = solicitacoes.filter((s) => s.status === "em_andamento" && s.voluntario_id === userId && !!s.data_agendada)
  const minhasConcluidas = solicitacoes.filter((s) => s.status === "concluida" && s.voluntario_id === userId)

  const renderCard = (solicitacao: Solicitacao) => (
    <Card
      key={solicitacao.id}
      className="bg-zinc-900 border-zinc-800 p-5 hover:bg-zinc-800/50 transition-all cursor-pointer hover:border-zinc-700"
      onClick={() => openDetails(solicitacao)}
    >
      <div className="space-y-4">
        {/* Header do Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-lg mb-1">{solicitacao.beneficiado.nome}</h4>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="h-3.5 w-3.5" />
              <span>{[solicitacao.beneficiado.bairro, solicitacao.beneficiado.cidade].filter(Boolean).join(", ") || "Endereço não informado"}</span>
            </div>
          </div>
          <Badge variant={getPrioridadeColor(solicitacao.prioridade) as any} className="shrink-0">
            {getPrioridadeLabel(solicitacao.prioridade)}
          </Badge>
        </div>

        {/* Necessidade */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500" />
            <p className="text-sm font-medium text-zinc-300">Necessidade</p>
          </div>
          <p className="text-sm text-white pl-3">{solicitacao.beneficiado.necessidade}</p>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500" />
            <p className="text-sm font-medium text-zinc-300">Descrição</p>
          </div>
          <p className="text-sm text-zinc-400 line-clamp-3 pl-3">{solicitacao.beneficiado.descricao}</p>
        </div>

        {/* Footer com informações adicionais */}
        <div className="pt-3 border-t border-zinc-800 space-y-2">
          {solicitacao.status === "concluida" ? (
            <>
              {solicitacao.data_agendada && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Visita agendada: {new Date(solicitacao.data_agendada).toLocaleDateString("pt-BR")} às {new Date(solicitacao.data_agendada).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Recebido em {new Date(solicitacao.created_at).toLocaleDateString("pt-BR")} às {new Date(solicitacao.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Concluído em {new Date(solicitacao.updated_at).toLocaleDateString("pt-BR")} às {new Date(solicitacao.updated_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </>
          ) : (
            <>
              {solicitacao.data_agendada && (() => {
                const vencida = new Date(solicitacao.data_agendada) < new Date()
                return (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className={`h-4 w-4 ${vencida ? "text-red-400" : "text-zinc-500"}`} />
                    <span className={vencida ? "text-red-400" : "text-zinc-400"}>Visita agendada:</span>
                    <span className={vencida ? "text-red-400 font-semibold" : "text-white"}>
                      {new Date(solicitacao.data_agendada).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(solicitacao.data_agendada).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )
              })()}
              {solicitacao.status === "em_andamento" && !solicitacao.data_agendada && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Assumida em: {new Date(solicitacao.updated_at).toLocaleDateString("pt-BR")} às {new Date(solicitacao.updated_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Recebido em {new Date(solicitacao.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando solicitações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Solicitações de Ajuda</h2>
        <p className="text-zinc-400 mt-2">Assuma responsabilidade e ajude quem precisa</p>
      </div>

      <Tabs defaultValue="disponiveis" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto inline-flex w-auto min-w-full md:flex">
            <TabsTrigger value="disponiveis" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              Disponíveis
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 ml-1">
                {aprovadas.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="assumidas" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              Assumidas
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 ml-1">
                {minhasAssumidas.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="minhas" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              Agendadas
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 ml-1">
                {minhasAgendadas.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="concluidas" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              Concluídos
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 ml-1">
                {minhasConcluidas.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Aba: Disponíveis */}
        <TabsContent value="disponiveis" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Disponíveis para Assumir</h3>
            <p className="text-sm text-zinc-400">Solicitações aguardando um voluntário responsável</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aprovadas.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Nenhuma solicitação disponível no momento</p>
                <p className="text-sm mt-2">Verifique novamente mais tarde</p>
              </div>
            ) : (
              aprovadas.map(renderCard)
            )}
          </div>
        </TabsContent>

        {/* Aba: Assumidas (sem data agendada) */}
        <TabsContent value="assumidas" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Solicitções Assumidas</h3>
            <p className="text-sm text-zinc-400">Você assumiu a responsabilidade, mas ainda não agendou a visita</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {minhasAssumidas.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Nenhuma solicitação assumida sem agendamento</p>
              </div>
            ) : (
              minhasAssumidas.map(renderCard)
            )}
          </div>
        </TabsContent>

        {/* Aba: Agendadas */}
        <TabsContent value="minhas" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Visitas Agendadas</h3>
            <p className="text-sm text-zinc-400">Atendimentos com data de visita definida</p>
          </div>
          {minhasAgendadas.some(s => s.data_agendada && new Date(s.data_agendada) < new Date()) && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Você tem visitas com data de agendamento vencida. Verifique os cards em vermelho.</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {minhasAgendadas.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Você não tem visitas agendadas</p>
                <p className="text-sm mt-2">Assuma uma solicitação e agende sua visita</p>
              </div>
            ) : (
              minhasAgendadas.map(renderCard)
            )}
          </div>
        </TabsContent>

        {/* Aba: Concluídos */}
        <TabsContent value="concluidas" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Atendimentos Concluídos</h3>
            <p className="text-sm text-zinc-400">Histórico dos seus atendimentos finalizados</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {minhasConcluidas.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Nenhum atendimento concluído ainda</p>
                <p className="text-sm mt-2">Complete suas primeiras visitas para vê-las aqui</p>
              </div>
            ) : (
              minhasConcluidas.map(renderCard)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes da Solicitação</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Informações completas da solicitação de ajuda
            </DialogDescription>
          </DialogHeader>
          {selectedSolicitacao && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getPrioridadeColor(selectedSolicitacao.prioridade) as any}>
                  {getPrioridadeLabel(selectedSolicitacao.prioridade)}
                </Badge>
                <Badge className="bg-zinc-800">{selectedSolicitacao.status.toUpperCase()}</Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Beneficiado</h4>
                <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 space-y-1">
                  <p className="text-white font-medium">{selectedSolicitacao.beneficiado.nome}</p>
                  {selectedSolicitacao.beneficiado.email && <p className="text-sm text-zinc-400">{selectedSolicitacao.beneficiado.email}</p>}
                  {selectedSolicitacao.beneficiado.telefone && <p className="text-sm text-zinc-400">Tel: {selectedSolicitacao.beneficiado.telefone}</p>}
                  <p className="text-sm text-zinc-400">{[selectedSolicitacao.beneficiado.endereco, selectedSolicitacao.beneficiado.bairro, selectedSolicitacao.beneficiado.cidade].filter(Boolean).join(", ")}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Necessidade</h4>
                <p className="text-white">{selectedSolicitacao.beneficiado.necessidade}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Descrição</h4>
                <p className="text-white bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                  {selectedSolicitacao.beneficiado.descricao}
                </p>
              </div>

              {selectedSolicitacao.voluntario && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-400">Voluntário Responsável</h4>
                  <p className="text-white">{selectedSolicitacao.voluntario.nome}</p>
                </div>
              )}

              {selectedSolicitacao.status === "concluida" ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-400">Data de Conclusão</h4>
                  <p className="text-white">
                    {new Date(selectedSolicitacao.updated_at).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(selectedSolicitacao.updated_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ) : selectedSolicitacao.data_agendada ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-400">Data Agendada</h4>
                  <p className="text-white">
                    {new Date(selectedSolicitacao.data_agendada).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(selectedSolicitacao.data_agendada).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Informações do Sistema</h4>
                <div className="text-sm text-zinc-400 space-y-1">
                  <p>Criado em: {new Date(selectedSolicitacao.created_at).toLocaleString("pt-BR")}</p>
                  <p>Atualizado em: {new Date(selectedSolicitacao.updated_at).toLocaleString("pt-BR")}</p>
                </div>
              </div>

              {/* Ações baseadas no status */}
              {selectedSolicitacao.status === "aprovada" && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setAssumirDialogOpen(true)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Assumir Responsabilidade
                  </Button>
                </div>
              )}

              {selectedSolicitacao.status === "em_andamento" && selectedSolicitacao.voluntario_id === userId && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      // Pré-preencher com a data/hora já salva, se existir
                      if (selectedSolicitacao?.data_agendada) {
                        const existing = new Date(selectedSolicitacao.data_agendada)
                        setDataAgendada(
                          `${existing.getFullYear()}-${String(existing.getMonth() + 1).padStart(2, "0")}-${String(existing.getDate()).padStart(2, "0")}`
                        )
                        setHoraAgendada(
                          `${String(existing.getHours()).padStart(2, "0")}:${String(existing.getMinutes()).padStart(2, "0")}`
                        )
                      } else {
                        setDataAgendada("")
                        setHoraAgendada("")
                      }
                      setAgendarDialogOpen(true)
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedSolicitacao.data_agendada ? "Alterar Data" : "Agendar Visita"}
                  </Button>
                  {selectedSolicitacao.data_agendada && (
                    <Button
                      onClick={() => setConcluirDialogOpen(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Assumir Responsabilidade */}
      <AlertDialog open={assumirDialogOpen} onOpenChange={setAssumirDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Assumir Responsabilidade</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Ao assumir esta solicitação, você se compromete a realizar o atendimento. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAssumirResponsabilidade} className="bg-blue-600 hover:bg-blue-700">
              Sim, assumir responsabilidade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Agendar Visita */}
      <Dialog open={agendarDialogOpen} onOpenChange={setAgendarDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Agendar Visita</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Defina a data e hora para realizar o atendimento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data" className="text-zinc-300">
                Data da Visita
              </Label>
              <Input
                id="data"
                type="date"
                value={dataAgendada}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDataAgendada(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora" className="text-zinc-300">
                Hora da Visita
              </Label>
              <Input
                id="hora"
                type="time"
                value={horaAgendada}
                onChange={(e) => setHoraAgendada(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setAgendarDialogOpen(false)
                  setDataAgendada("")
                  setHoraAgendada("")
                }}
                variant="outline"
                className="flex-1 border-zinc-700"
              >
                Cancelar
              </Button>
              <Button onClick={handleAgendarVisita} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Calendar className="h-4 w-4 mr-2" />
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Concluir */}
      <AlertDialog open={concluirDialogOpen} onOpenChange={setConcluirDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Marcar como Concluído</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Confirma que o atendimento foi realizado com sucesso?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConcluir} className="bg-green-600 hover:bg-green-700">
              Sim, concluir atendimento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
