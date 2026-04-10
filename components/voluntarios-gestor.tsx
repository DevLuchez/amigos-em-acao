"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Search, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { normalizeString } from "@/lib/utils/string-utils"
import { deleteUser } from "@/app/actions/delete-user"
import { notifyVoluntariosSolicitacaoDisponivel } from "@/app/actions/notify-solicitacoes"
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

type Voluntario = {
  id: string
  nome: string
  email: string
  telefone: string
}

export default function VoluntariosGestor() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [voluntarioToDelete, setVoluntarioToDelete] = useState<string | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadVoluntarios()
  }, [])

  const loadVoluntarios = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("voluntarios").select("*").order("nome", { ascending: true })

    if (error) {
      alert(`Erro ao carregar voluntários: ${error.message}`)
      setLoading(false)
      return
    }

    if (data) {
      setVoluntarios(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()

    // Reverter solicitações em_andamento do voluntário para aprovada (aba Buscando)
    const { data: solicitacoesRevertidas } = await supabase
      .from("solicitacoes_ajuda")
      .update({ status: "aprovada", voluntario_id: null, data_agendada: null })
      .eq("voluntario_id", id)
      .eq("status", "em_andamento")
      .select("beneficiado:beneficiados(nome, necessidade)")

    const result = await deleteUser(id)

    if (!result.success) {
      alert(`Erro ao deletar voluntário: ${result.error}`)
      return
    }

    // Notificar voluntários sobre cada solicitação que voltou para Buscando
    if (solicitacoesRevertidas && solicitacoesRevertidas.length > 0) {
      solicitacoesRevertidas.forEach((s: any) => {
        if (s.beneficiado) {
          notifyVoluntariosSolicitacaoDisponivel(
            s.beneficiado.nome,
            s.beneficiado.necessidade
          ).catch(() => {})
        }
      })
    }

    setVoluntarios(voluntarios.filter((v) => v.id !== id))
    setDeleteDialogOpen(false)
    setVoluntarioToDelete(null)
  }

  const handleBulkDelete = async () => {
    const supabase = createClient()

    // Reverter solicitações em_andamento de todos os voluntários selecionados
    const { data: solicitacoesRevertidas } = await supabase
      .from("solicitacoes_ajuda")
      .update({ status: "aprovada", voluntario_id: null, data_agendada: null })
      .in("voluntario_id", selectedIds)
      .eq("status", "em_andamento")
      .select("beneficiado:beneficiados(nome, necessidade)")

    const errors: string[] = []
    for (const id of selectedIds) {
      const result = await deleteUser(id)
      if (!result.success) {
        errors.push(result.error || "Erro desconhecido")
      }
    }

    if (errors.length > 0) {
      alert(`Erro ao deletar alguns voluntários: ${errors[0]}`)
    }

    // Notificar voluntários sobre cada solicitação que voltou para Buscando
    if (solicitacoesRevertidas && solicitacoesRevertidas.length > 0) {
      solicitacoesRevertidas.forEach((s: any) => {
        if (s.beneficiado) {
          notifyVoluntariosSolicitacaoDisponivel(
            s.beneficiado.nome,
            s.beneficiado.necessidade
          ).catch(() => {})
        }
      })
    }

    setVoluntarios(voluntarios.filter((v) => !selectedIds.includes(v.id)))
    setSelectedIds([])
    setBulkDeleteDialogOpen(false)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredVoluntarios.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredVoluntarios.map((v) => v.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const filteredVoluntarios = voluntarios.filter((voluntario) =>
    normalizeString(voluntario.nome).includes(normalizeString(searchTerm)),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando voluntários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header fixo */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Voluntários Cadastrados</h2>
          <p className="text-zinc-400 mt-1">Gerencie os voluntários cadastrados no sistema</p>
        </div>

        {/* Barra de pesquisa e botão de exclusão em massa */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
            />
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
        {filteredVoluntarios.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            {searchTerm ? "Nenhum voluntário encontrado com esse nome" : "Nenhum voluntário cadastrado"}
          </div>
        ) : (
          filteredVoluntarios.map((voluntario) => (
            <div key={voluntario.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Checkbox
                    checked={selectedIds.includes(voluntario.id)}
                    onCheckedChange={() => toggleSelect(voluntario.id)}
                    className="border-zinc-600 shrink-0"
                  />
                  <span className="text-white font-medium truncate">{voluntario.nome}</span>
                </div>
                <Button
                  onClick={() => { setVoluntarioToDelete(voluntario.id); setDeleteDialogOpen(true) }}
                  variant="ghost"
                  size="icon"
                  disabled={selectedIds.length > 0}
                  className="h-8 w-8 text-red-500 hover:text-red-400 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-zinc-400 truncate">{voluntario.email}</div>
              {voluntario.telefone && <div className="text-sm text-zinc-400">{voluntario.telefone}</div>}
            </div>
          ))
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block border border-zinc-800 rounded-lg overflow-x-auto overflow-y-hidden bg-zinc-900">
        <div>
          <div className="bg-zinc-800 border-b border-zinc-700">
            <div className="grid grid-cols-[50px_1fr_1fr_1fr_80px] gap-4 px-4 py-3 text-sm font-medium text-zinc-300">
              <div className="flex items-center">
                <Checkbox
                  checked={selectedIds.length === filteredVoluntarios.length && filteredVoluntarios.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-zinc-600"
                />
              </div>
              <div>Nome</div>
              <div>E-mail</div>
              <div>Telefone</div>
              <div className="text-center">Ações</div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {filteredVoluntarios.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                {searchTerm ? "Nenhum voluntário encontrado com esse nome" : "Nenhum voluntário cadastrado"}
              </div>
            ) : (
              filteredVoluntarios.map((voluntario) => (
                <div
                  key={voluntario.id}
                  className="grid grid-cols-[50px_1fr_1fr_1fr_80px] gap-4 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedIds.includes(voluntario.id)}
                      onCheckedChange={() => toggleSelect(voluntario.id)}
                      className="border-zinc-600"
                    />
                  </div>
                  <div className="text-white truncate">{voluntario.nome}</div>
                  <div className="text-zinc-300 truncate">{voluntario.email}</div>
                  <div className="text-zinc-300">{voluntario.telefone}</div>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => { setVoluntarioToDelete(voluntario.id); setDeleteDialogOpen(true) }}
                      variant="ghost"
                      size="icon"
                      disabled={selectedIds.length > 0}
                      className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão individual */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir este voluntário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => voluntarioToDelete && handleDelete(voluntarioToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de exclusão em massa */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão em Massa</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir {selectedIds.length} voluntário(s)? Esta ação não pode ser desfeita.
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
