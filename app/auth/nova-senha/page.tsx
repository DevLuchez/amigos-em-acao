"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NovaSenhaPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [sessaoValida, setSessaoValida] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  // O callback já trocou o code por sessão — basta verificar se existe
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setSessaoValida(!!data.session)
      setCheckingSession(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError("Não foi possível atualizar a senha. O link pode ter expirado.")
      setIsLoading(false)
      return
    }

    setSucesso(true)
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Nova senha</CardTitle>
              <CardDescription className="text-zinc-400">
                Escolha uma nova senha para sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sucesso ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="text-white font-semibold text-lg">Senha atualizada!</p>
                  <p className="text-sm text-zinc-400">
                    Sua senha foi alterada com sucesso.
                  </p>
                  <Button
                    onClick={() => router.push("/auth/login")}
                    className="mt-2 w-full bg-white text-black hover:bg-zinc-200"
                  >
                    Voltar ao login
                  </Button>
                </div>
              ) : checkingSession ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              ) : !sessaoValida ? (
                <div className="py-4 text-center space-y-4">
                  <p className="text-sm text-zinc-400">
                    Link inválido ou expirado. Solicite um novo link de redefinição.
                  </p>
                  <Link
                    href="/auth/esqueci-senha"
                    className="text-white underline underline-offset-4 text-sm"
                  >
                    Solicitar novo link
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-white">
                        Nova senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirmar nova senha
                      </Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Salvando..." : "Salvar nova senha"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
