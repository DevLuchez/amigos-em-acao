"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { createUserProfile } from "@/app/actions/create-user-profile"
import { deleteUser } from "@/app/actions/delete-user"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Gestor = {
  id: string
  nome: string
  email: string
  telefone: string
}

export default function GestoresGestor({ currentUserId }: { currentUserId: string }) {
  const [gestores, setGestores] = useState<Gestor[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gestorToDelete, setGestorToDelete] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form fields
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")

  useEffect(() => {
    loadGestores()
  }, [])

  const loadGestores = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, email, telefone")
      .eq("tipo", "gestor")
      .order("nome", { ascending: true })

    if (error) {
      alert(`Erro ao carregar gestores: ${error.message}`)
      setLoading(false)
      return
    }

    if (data) {
      setGestores(data)
    }
    setLoading(false)
  }

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handleCreate = async () => {
    setFormError("")
    setFormSuccess("")

    if (!nome.trim()) { setFormError("Nome é obrigatório"); return }
    if (!email.trim() || !email.includes("@")) { setFormError("E-mail válido é obrigatório"); return }
    if (!senha || senha.length < 8) { setFormError("Senha deve ter no mínimo 8 caracteres"); return }

    setCreating(true)

    try {
      // Criar usuário no auth via client (usa signUp que não loga automaticamente em server action)
      const supabase = createClient()

      // Verificar se email já existe
      const { data: emailExists } = await supabase.rpc("check_email_exists", { email_to_check: email })
      if (emailExists) {
        setFormError("Este e-mail já está cadastrado")
        setCreating(false)
        return
      }

      // Criar no Supabase Auth via admin (server action)
      const response = await fetch("/api/create-gestor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, senha }),
      })

      const result = await response.json()

      if (!result.success) {
        setFormError(result.error || "Erro ao criar gestor")
        setCreating(false)
        return
      }

      setFormSuccess("Gestor cadastrado com sucesso!")
      setNome("")
      setEmail("")
      setTelefone("")
      setSenha("")
      await loadGestores()

      setTimeout(() => {
        setCreateDialogOpen(false)
        setFormSuccess("")
      }, 1500)
    } catch {
      setFormError("Erro ao criar gestor. Tente novamente.")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (gestores.length <= 1) {
      alert("Deve haver pelo menos 1 gestor no sistema.")
      setDeleteDialogOpen(false)
      return
    }

    const result = await deleteUser(id)
    if (!result.success) {
      alert(`Erro ao deletar gestor: ${result.error}`)
      return
    }

    setGestores(gestores.filter((g) => g.id !== id))
    setDeleteDialogOpen(false)
    setGestorToDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando gestores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestores Cadastrados</h2>
            <p className="text-zinc-400 mt-1">Gerencie os gestores do sistema</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Gestor
          </Button>
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {gestores.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">Nenhum gestor cadastrado</div>
        ) : (
          gestores.map((gestor) => (
            <div key={gestor.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium truncate">{gestor.nome}</span>
                <Button
                  onClick={() => { setGestorToDelete(gestor.id); setDeleteDialogOpen(true) }}
                  variant="ghost"
                  size="icon"
                  disabled={gestor.id === currentUserId || gestores.length <= 1}
                  className="h-8 w-8 text-red-500 hover:text-red-400 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-zinc-400 truncate">{gestor.email}</div>
              {gestor.telefone && <div className="text-sm text-zinc-400">{gestor.telefone}</div>}
            </div>
          ))
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block border border-zinc-800 rounded-lg overflow-x-auto overflow-y-hidden bg-zinc-900">
        <div>
          <div className="bg-zinc-800 border-b border-zinc-700">
            <div className="grid grid-cols-[1fr_1fr_1fr_80px] gap-4 px-4 py-3 text-sm font-medium text-zinc-300">
              <div>Nome</div>
              <div>E-mail</div>
              <div>Telefone</div>
              <div className="text-center">Ações</div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {gestores.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">Nenhum gestor cadastrado</div>
            ) : (
              gestores.map((gestor) => (
                <div
                  key={gestor.id}
                  className="grid grid-cols-[1fr_1fr_1fr_80px] gap-4 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="text-white truncate">{gestor.nome}</div>
                  <div className="text-zinc-300 truncate">{gestor.email}</div>
                  <div className="text-zinc-300">{gestor.telefone || "-"}</div>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => { setGestorToDelete(gestor.id); setDeleteDialogOpen(true) }}
                      variant="ghost"
                      size="icon"
                      disabled={gestor.id === currentUserId || gestores.length <= 1}
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

      {/* Dialog de cadastro */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Cadastrar Novo Gestor</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Preencha os dados para criar uma nova conta de gestor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Nome completo *</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do gestor"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">E-mail *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Telefone</Label>
              <Input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Senha *</Label>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {formError && <p className="text-sm text-red-400">{formError}</p>}
            {formSuccess && <p className="text-sm text-green-400">{formSuccess}</p>}

            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? "Cadastrando..." : "Cadastrar Gestor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir este gestor? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => gestorToDelete && handleDelete(gestorToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
