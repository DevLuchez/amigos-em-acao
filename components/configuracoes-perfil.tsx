"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteOwnAccount } from "@/app/actions/delete-user"
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

type ConfiguracoesPerfilProps = {
  userId: string
  userType: "gestor" | "voluntario"
  initialProfile?: {
    nome: string | null
    email: string | null
    telefone: string | null
  } | null
}

export default function ConfiguracoesPerfil({ userId, userType, initialProfile }: ConfiguracoesPerfilProps) {
  const router = useRouter()
  const [nome, setNome] = useState(initialProfile?.nome || "")
  const [email, setEmail] = useState(initialProfile?.email || "")
  const [telefone, setTelefone] = useState(initialProfile?.telefone || "")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    return telefone
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value)
    setTelefone(formatted)
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage("")

    try {
      const supabase = createClient()

      const { error: profileError } = await supabase.from("profiles").update({ nome, telefone }).eq("id", userId)

      if (profileError) throw profileError

      if (userType === "voluntario") {
        const { error: voluntarioError } = await supabase
          .from("voluntarios")
          .update({ nome, telefone })
          .eq("id", userId)

        if (voluntarioError) throw voluntarioError
      }

      if (novaSenha) {
        if (novaSenha !== confirmarSenha) {
          setMessage("As senhas não coincidem")
          setLoading(false)
          return
        }

        if (novaSenha.length < 8) {
          setMessage("A senha deve ter no mínimo 8 caracteres")
          setLoading(false)
          return
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: novaSenha,
        })

        if (passwordError) throw passwordError
      }

      setMessage("Perfil atualizado com sucesso!")
      setNovaSenha("")
      setConfirmarSenha("")
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido"
      setMessage(`Erro ao atualizar perfil: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações do Perfil</h1>
        <p className="text-zinc-400 mt-2">Gerencie suas informações pessoais e preferências</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Informações Pessoais</CardTitle>
          <CardDescription className="text-zinc-400">Atualize seus dados cadastrais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-white">
              Nome Completo
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-zinc-800 border-zinc-700 text-zinc-500"
            />
            <p className="text-xs text-zinc-500">O email não pode ser alterado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-white">
              Telefone
            </Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={handleTelefoneChange}
              placeholder="(00) 00000-0000"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Alterar Senha</CardTitle>
          <CardDescription className="text-zinc-400">Deixe em branco se não quiser alterar a senha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="novaSenha" className="text-white">
              Nova Senha
            </Label>
            <div className="relative">
              <Input
                id="novaSenha"
                type={showPassword ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="bg-zinc-800 border-zinc-700 text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha" className="text-white">
              Confirmar Nova Senha
            </Label>
            <Input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("sucesso") ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Salvando..." : "Salvar Alterações"}
      </Button>

      <Card className="bg-zinc-900 border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400">Zona de Perigo</CardTitle>
          <CardDescription className="text-zinc-400">
            {userType === "gestor"
              ? "Ao excluir sua conta, todos os seus dados serão removidos. Só é possível excluir se houver outro gestor no sistema."
              : "Ao excluir sua conta, todos os seus dados serão permanentemente removidos."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleting}
          >
            {deleting ? "Excluindo..." : "Excluir Minha Conta"}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setDeleting(true)
                const result = await deleteOwnAccount(userId)
                if (!result.success) {
                  setMessage(result.error || "Erro ao excluir conta")
                  setDeleting(false)
                  setDeleteDialogOpen(false)
                  return
                }
                const supabase = createClient()
                await supabase.auth.signOut()
                router.refresh()
                router.push("/")
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
