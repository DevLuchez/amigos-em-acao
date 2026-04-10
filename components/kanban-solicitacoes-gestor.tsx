"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
import { CheckCircle, XCircle, Loader2, Clock, User, MapPin } from 'lucide-react'
import { useEffect, useState } from "react"
import { notifyVoluntariosSolicitacaoAprovada } from "@/app/actions/notify-solicitacoes"

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
  justificativa_reprovacao: string | null
  created_at: string
  updated_at: string
  beneficiado: Beneficiado
  voluntario?: { nome: string } | null
}

export default function KanbanSolicitacoesGestor() {
  const { toast } = useToast()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [reprovarDialogOpen, setReprovarDialogOpen] = useState(false)
  const [aprovarDialogOpen, setAprovarDialogOpen] = useState(false)
  const [justificativa, setJustificativa] = useState("")

  useEffect(() => {
    loadSolicitacoes()
  }, [])

  const loadSolicitacoes = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from("solicitacoes_ajuda")
      .select(
        `
        *,
        beneficiado:beneficiados(id, nome, email, telefone, endereco, bairro, cidade, necessidade, descricao),
        voluntario:profiles!solicitacoes_ajuda_voluntario_id_fkey(nome)
      `,
      )
      .order("created_at", { ascending: false })

    if (data) {
      setSolicitacoes(data as unknown as Solicitacao[])
    }
    setLoading(false)
  }

  const handleAprovar = async () => {
    if (!selectedSolicitacao) return

    const supabase = createClient()
    const { error } = await supabase
      .from("solicitacoes_ajuda")
      .update({ status: "aprovada" })
      .eq("id", selectedSolicitacao.id)

    if (!error) {
      toast({
        title: "Solicitação aprovada",
        description: "A solicitação foi aprovada e está disponível para voluntários.",
        duration: 3000,
      })

      // Notificar voluntários (fire-and-forget)
      notifyVoluntariosSolicitacaoAprovada(
        selectedSolicitacao.beneficiado.nome,
        selectedSolicitacao.beneficiado.necessidade
      ).catch(() => {})

      loadSolicitacoes()
      setAprovarDialogOpen(false)
      setDetailsDialogOpen(false)
    }
  }

  const handleReprovar = async () => {
    if (!selectedSolicitacao || !justificativa.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "Por favor, informe o motivo da reprovação.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("solicitacoes_ajuda")
      .update({
        status: "reprovada",
        justificativa_reprovacao: justificativa,
      })
      .eq("id", selectedSolicitacao.id)

    if (!error) {
      toast({
        title: "Solicitação reprovada",
        description: "A solicitação foi reprovada com justificativa.",
        duration: 3000,
      })
      loadSolicitacoes()
      setReprovarDialogOpen(false)
      setDetailsDialogOpen(false)
      setJustificativa("")
    }
  }

  const handleReabrir = async () => {
    if (!selectedSolicitacao) return

    const supabase = createClient()
    const { error } = await supabase
      .from("solicitacoes_ajuda")
      .update({
        status: "nova",
        justificativa_reprovacao: null,
      })
      .eq("id", selectedSolicitacao.id)

    if (!error) {
      toast({
        title: "Solicitação reaberta",
        description: "A solicitação foi reaberta e retornou para novas solicitações.",
        duration: 3000,
      })
      loadSolicitacoes()
      setDetailsDialogOpen(false)
    }
  }

  const handleAlterarPrioridade = async (novaPrioridade: "baixa" | "media" | "alta") => {
    if (!selectedSolicitacao) return

    const supabase = createClient()
    const { error } = await supabase
      .from("solicitacoes_ajuda")
      .update({ prioridade: novaPrioridade })
      .eq("id", selectedSolicitacao.id)

    if (!error) {
      toast({
        title: "Prioridade alterada",
        description: `Prioridade alterada para ${getPrioridadeLabel(novaPrioridade)}.`,
        duration: 3000,
      })
      loadSolicitacoes()
      setSelectedSolicitacao({ ...selectedSolicitacao, prioridade: novaPrioridade })
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

  const novas = solicitacoes.filter((s) => s.status === "nova")
  const aprovadas = solicitacoes.filter((s) => s.status === "aprovada")
  const emAndamento = solicitacoes.filter((s) => s.status === "em_andamento")
  const concluidas = solicitacoes.filter((s) => s.status === "concluida")
  const reprovadas = solicitacoes.filter((s) => s.status === "reprovada")

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
          {solicitacao.voluntario && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-zinc-500" />
              <span className="text-zinc-400">Responsável:</span>
              <span className="text-white font-medium">{solicitacao.voluntario.nome}</span>
            </div>
          )}

          {solicitacao.data_agendada && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span className="text-zinc-400">Agendado:</span>
              <span className="text-white">
                {new Date(solicitacao.data_agendada).toLocaleDateString("pt-BR")} às{" "}
                {new Date(solicitacao.data_agendada).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Criado em {new Date(solicitacao.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
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
        <h2 className="text-2xl font-bold text-white">Gerenciamento de Solicitações</h2>
        <p className="text-zinc-400 mt-2">Acompanhe todas as solicitações de ajuda em cada etapa do processo</p>
      </div>

      <Tabs defaultValue="novas" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto inline-flex w-auto min-w-full md:flex md:flex-wrap">
          <TabsTrigger value="novas" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
            Novas
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 ml-1">
              {novas.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="aprovadas" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
            Buscando
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 ml-1">
              {aprovadas.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="andamento" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
            Agendada
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 ml-1">
              {emAndamento.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="concluidas" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
            Concluído
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 ml-1">
              {concluidas.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reprovadas" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
            Reprovadas
            <Badge variant="secondary" className="bg-red-500/20 text-red-400 ml-1">
              {reprovadas.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Aba: Novas Solicitações */}
        <TabsContent value="novas" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Novas Solicitações</h3>
            <p className="text-sm text-zinc-400">Analise e aprove ou reprove as solicitações recebidas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {novas.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Nenhuma solicitação nova no momento</p>
              </div>
            ) : (
              novas.map(renderCard)
            )}
          </div>
        </TabsContent>

        {/* Aba: Buscando Responsável */}
        <TabsContent value="aprovadas" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Buscando Responsável</h3>
            <p className="text-sm text-zinc-400">Solicitações aprovadas aguardando voluntário</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aprovadas.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Nenhuma solicitação aguardando voluntário</p>
              </div>
            ) : (
              aprovadas.map(renderCard)
            )}
          </div>
        </TabsContent>

        {/* Aba: Visita Agendada */}
        <TabsContent value="andamento" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Visita Agendada</h3>
            <p className="text-sm text-zinc-400">Atendimentos em andamento pelos voluntários</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emAndamento.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Nenhuma visita agendada no momento</p>
              </div>
            ) : (
              emAndamento.map(renderCard)
            )}
          </div>
        </TabsContent>

        {/* Aba: Concluído */}
        <TabsContent value="concluidas" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Concluído</h3>
            <p className="text-sm text-zinc-400">Atendimentos finalizados com sucesso</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concluidas.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Nenhuma solicitação concluída ainda</p>
              </div>
            ) : (
              concluidas.map(renderCard)
            )}
          </div>
        </TabsContent>

        {/* Aba: Reprovadas */}
        <TabsContent value="reprovadas" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Reprovadas</h3>
            <p className="text-sm text-zinc-400">Solicitações que não foram aprovadas pelo gestor</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reprovadas.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <p className="text-lg">Nenhuma solicitação reprovada</p>
              </div>
            ) : (
              reprovadas.map(renderCard)
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

              {selectedSolicitacao.justificativa_reprovacao && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-400">Justificativa de Reprovação</h4>
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                    <p className="text-red-400">{selectedSolicitacao.justificativa_reprovacao}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Informações do Sistema</h4>
                <div className="text-sm text-zinc-400 space-y-1">
                  <p>Criado em: {new Date(selectedSolicitacao.created_at).toLocaleString("pt-BR")}</p>
                  <p>Atualizado em: {new Date(selectedSolicitacao.updated_at).toLocaleString("pt-BR")}</p>
                </div>
              </div>

              {selectedSolicitacao.status === "nova" && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setAprovarDialogOpen(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button onClick={() => setReprovarDialogOpen(true)} variant="destructive" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reprovar
                  </Button>
                </div>
              )}

              {selectedSolicitacao.status === "nova" && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-medium text-zinc-400">Alterar Prioridade</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAlterarPrioridade("baixa")}
                      variant="outline"
                      size="sm"
                      className={`flex-1 border-zinc-700 ${selectedSolicitacao.prioridade === "baixa" ? "bg-zinc-700" : ""}`}
                    >
                      Baixa
                    </Button>
                    <Button
                      onClick={() => handleAlterarPrioridade("media")}
                      variant="outline"
                      size="sm"
                      className={`flex-1 border-zinc-700 ${selectedSolicitacao.prioridade === "media" ? "bg-zinc-700" : ""}`}
                    >
                      Média
                    </Button>
                    <Button
                      onClick={() => handleAlterarPrioridade("alta")}
                      variant="outline"
                      size="sm"
                      className={`flex-1 border-zinc-700 ${selectedSolicitacao.prioridade === "alta" ? "bg-zinc-700" : ""}`}
                    >
                      Alta
                    </Button>
                  </div>
                </div>
              )}

              {selectedSolicitacao.status === "reprovada" && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleReabrir} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Reabrir Solicitação
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Aprovação */}
      <AlertDialog open={aprovarDialogOpen} onOpenChange={setAprovarDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Aprovar Solicitação</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Ao aprovar, a solicitação ficará disponível para que voluntários possam assumir a responsabilidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAprovar} className="bg-green-600 hover:bg-green-700">
              Confirmar Aprovação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Reprovação */}
      <Dialog open={reprovarDialogOpen} onOpenChange={setReprovarDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Reprovar Solicitação</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Informe o motivo da reprovação. Esta justificativa ficará registrada no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="justificativa" className="text-zinc-300">
                Justificativa (obrigatória)
              </Label>
              <Textarea
                id="justificativa"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Ex: Solicitação duplicada, informações insuficientes, fora do escopo da ONG..."
                className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setReprovarDialogOpen(false)
                  setJustificativa("")
                }}
                variant="outline"
                className="flex-1 border-zinc-700"
              >
                Cancelar
              </Button>
              <Button onClick={handleReprovar} variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Confirmar Reprovação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
