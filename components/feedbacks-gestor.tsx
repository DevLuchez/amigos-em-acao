"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageSquare, Star, AlertTriangle, TrendingUp, Trash2, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

type Feedback = {
  id: string
  mensagem: string
  anonimo: boolean
  estrelas: number
  nome: string | null
  email: string | null
  created_at: string
}

export default function FeedbacksGestor() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [totalFeedbacks, setTotalFeedbacks] = useState(0)
  const [feedbacks5Estrelas, setFeedbacks5Estrelas] = useState(0)
  const [feedbacksBaixos, setFeedbacksBaixos] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false })

    if (error) {
      alert(`Erro ao carregar feedbacks: ${error.message}`)
      setLoading(false)
      return
    }

    if (data) {
      setFeedbacks(data)
      setTotalFeedbacks(data.length)
      setFeedbacks5Estrelas(data.filter((f) => f.estrelas === 5).length)
      setFeedbacksBaixos(data.filter((f) => f.estrelas <= 2).length)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("feedbacks").delete().eq("id", id)
    if (error) {
      alert(`Erro ao excluir feedback: ${error.message}`)
      return
    }
    setFeedbacks(feedbacks.filter((f) => f.id !== id))
    setDeleteDialogOpen(false)
    setDetailsDialogOpen(false)
    setFeedbackToDelete(null)
    const newFeedbacks = feedbacks.filter((f) => f.id !== id)
    setTotalFeedbacks(newFeedbacks.length)
    setFeedbacks5Estrelas(newFeedbacks.filter((f) => f.estrelas === 5).length)
    setFeedbacksBaixos(newFeedbacks.filter((f) => f.estrelas <= 2).length)
  }

  const handleBulkDelete = async () => {
    const supabase = createClient()
    const { error } = await supabase.from("feedbacks").delete().in("id", selectedIds)
    if (error) {
      alert(`Erro ao excluir feedbacks: ${error.message}`)
      return
    }
    const newFeedbacks = feedbacks.filter((f) => !selectedIds.includes(f.id))
    setFeedbacks(newFeedbacks)
    setSelectedIds([])
    setBulkDeleteDialogOpen(false)
    setTotalFeedbacks(newFeedbacks.length)
    setFeedbacks5Estrelas(newFeedbacks.filter((f) => f.estrelas === 5).length)
    setFeedbacksBaixos(newFeedbacks.filter((f) => f.estrelas <= 2).length)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === feedbacks.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(feedbacks.map((f) => f.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const openDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setDetailsDialogOpen(true)
  }

  const getUrgencia = (estrelas: number) => {
    if (estrelas <= 2) return { label: "Alta", color: "destructive" as const }
    if (estrelas === 3) return { label: "Média", color: "default" as const }
    return { label: "Baixa", color: "secondary" as const }
  }

  const renderEstrelas = (quantidade: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= quantidade ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando feedbacks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-zinc-400">Total de Feedbacks</h3>
            <MessageSquare className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white">{totalFeedbacks}</div>
          <p className="text-xs text-zinc-500 mt-1">Feedbacks recebidos</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-zinc-400">Feedbacks 5 Estrelas</h3>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white">{feedbacks5Estrelas}</div>
          <p className="text-xs text-zinc-500 mt-1">Avaliações excelentes</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-zinc-400">Feedbacks ≤ 2 Estrelas</h3>
            <AlertTriangle className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white">{feedbacksBaixos}</div>
          <p className="text-xs text-zinc-500 mt-1">Requerem atenção</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Caixa de Entrada de Feedbacks</h2>
            <p className="text-zinc-400 mt-1">Todos os feedbacks recebidos da landing page</p>
          </div>
          {selectedIds.length > 0 && (
            <Button
              onClick={() => setBulkDeleteDialogOpen(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Selecionados ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">Nenhum feedback recebido ainda</div>
        ) : (
          feedbacks.map((feedback) => {
            const urgencia = getUrgencia(feedback.estrelas)
            return (
              <div
                key={feedback.id}
                onClick={() => openDetails(feedback)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3 cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.includes(feedback.id)}
                      onCheckedChange={() => toggleSelect(feedback.id)}
                      className="border-zinc-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge variant={urgencia.color}>{urgencia.label}</Badge>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => { setFeedbackToDelete(feedback.id); setDeleteDialogOpen(true) }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium truncate">
                    {feedback.anonimo ? "Anônimo" : feedback.nome || "Usuário"}
                  </span>
                  {renderEstrelas(feedback.estrelas)}
                </div>
                <p className="text-zinc-400 text-sm line-clamp-2">{feedback.mensagem}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(feedback.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block border border-zinc-800 rounded-lg overflow-x-auto overflow-y-hidden bg-zinc-900">
        <div>
          <div className="bg-zinc-800 border-b border-zinc-700">
            <div className="grid grid-cols-[50px_120px_200px_120px_1fr_150px_80px] gap-4 px-4 py-3 text-sm font-medium text-zinc-300">
            <div className="flex items-center">
              <Checkbox
                checked={selectedIds.length === feedbacks.length && feedbacks.length > 0}
                onCheckedChange={toggleSelectAll}
                className="border-zinc-600"
              />
            </div>
            <div>Urgência</div>
            <div>Remetente</div>
            <div>Estrelas</div>
            <div>Mensagem</div>
            <div>Data de Envio</div>
            <div className="text-center">Ações</div>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">Nenhum feedback recebido ainda</div>
          ) : (
            feedbacks.map((feedback) => {
              const urgencia = getUrgencia(feedback.estrelas)
              return (
                <div
                  key={feedback.id}
                  className="grid grid-cols-[50px_120px_200px_120px_1fr_150px_80px] gap-4 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('[role="checkbox"]')) return
                    if ((e.target as HTMLElement).closest("button")) return
                    openDetails(feedback)
                  }}
                >
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(feedback.id)}
                      onCheckedChange={() => toggleSelect(feedback.id)}
                      className="border-zinc-600"
                    />
                  </div>
                  <div>
                    <Badge variant={urgencia.color}>{urgencia.label}</Badge>
                  </div>
                  <div className="text-white truncate">
                    {feedback.anonimo ? "Feedback Anônimo" : feedback.nome || "Usuário"}
                    {!feedback.anonimo && feedback.email && (
                      <div className="text-xs text-zinc-400 truncate">{feedback.email}</div>
                    )}
                  </div>
                  <div>{renderEstrelas(feedback.estrelas)}</div>
                  <div className="text-zinc-300 text-sm line-clamp-2">{feedback.mensagem}</div>
                  <div className="text-sm text-zinc-400">
                    {new Date(feedback.created_at).toLocaleDateString("pt-BR")}
                    <div className="text-xs">
                      {new Date(feedback.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => {
                        setFeedbackToDelete(feedback.id)
                        setDeleteDialogOpen(true)
                      }}
                      variant="ghost"
                      size="icon"
                      disabled={selectedIds.length > 0}
                      className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
        </div>
      </div>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes do Feedback</DialogTitle>
            <DialogDescription className="text-zinc-400">Visualize todos os detalhes do feedback</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Remetente</h4>
                <p className="text-white">
                  {selectedFeedback.anonimo ? "Feedback Anônimo" : selectedFeedback.nome || "Usuário"}
                </p>
                {!selectedFeedback.anonimo && selectedFeedback.email && (
                  <p className="text-sm text-zinc-400">{selectedFeedback.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Avaliação</h4>
                {renderEstrelas(selectedFeedback.estrelas)}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Urgência</h4>
                <Badge variant={getUrgencia(selectedFeedback.estrelas).color}>
                  {getUrgencia(selectedFeedback.estrelas).label}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Mensagem</h4>
                <p className="text-white bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                  {selectedFeedback.mensagem}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400">Data de Envio</h4>
                <p className="text-white">
                  {new Date(selectedFeedback.created_at).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(selectedFeedback.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setFeedbackToDelete(selectedFeedback.id)
                    setDeleteDialogOpen(true)
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Feedback
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir este feedback? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => feedbackToDelete && handleDelete(feedbackToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão em Massa</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir {selectedIds.length} feedback(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Excluir Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
