"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Check, X, ArrowLeft } from "lucide-react"
import { createUserProfile } from "@/app/actions/create-user-profile"

export default function CadastroPage() {
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [tipo, setTipo] = useState<"voluntario" | "gestor">("voluntario")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const router = useRouter()

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const checkEmailExists = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes("@")) {
      setEmailError(null)
      return
    }

    setIsCheckingEmail(true)
    setEmailError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("check_email_exists", { email_to_check: emailToCheck })

      if (error) {
        console.error("[v0] Erro ao verificar email:", error)
        return
      }

      if (data === true) {
        setEmailError("Este email já está cadastrado")
      }
    } catch (error) {
      console.error("[v0] Erro ao verificar email:", error)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleEmailBlur = () => {
    checkEmailExists(email)
  }

  const passwordHas8Chars = password.length >= 8
  const passwordsMatch = password === repeatPassword && repeatPassword.length > 0

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (emailError) {
      setError("Por favor, corrija os erros antes de continuar")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Iniciando cadastro com dados:", { nome, telefone, email, tipo })

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard/${tipo}`,
          data: {
            nome,
            telefone,
            tipo,
          },
        },
      })

      if (authError) {
        console.error("[v0] Erro no signup do Auth:", authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error("Usuário não foi criado")
      }

      console.log("[v0] Usuário criado no Auth com sucesso:", authData.user.id)

      console.log("[v0] Criando perfil e registros usando server action...")
      const result = await createUserProfile({
        id: authData.user.id,
        nome,
        email,
        telefone,
        tipo,
      })

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar perfil")
      }

      console.log("[v0] Cadastro completo realizado com sucesso")

      router.push("/auth/cadastro-sucesso")
    } catch (error: unknown) {
      console.error("[v0] Erro capturado ao criar conta:", error)
      if (error instanceof Error) {
        console.error("[v0] Detalhes do erro:", {
          message: error.message,
          stack: error.stack,
        })
        setError(error.message)
      } else {
        setError("Erro ao criar conta. Por favor, tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar para página inicial
        </Link>

        <div className="flex flex-col gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Cadastro</CardTitle>
              <CardDescription className="text-zinc-400">
                Crie sua conta para fazer parte da nossa comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome" className="text-white">
                      Nome completo
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu Nome"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefone" className="text-white">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      type="tel"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      className={`bg-zinc-800 border-zinc-700 text-white ${emailError ? "border-red-500" : ""}`}
                    />
                    {isCheckingEmail && <p className="text-xs text-zinc-400">Verificando email...</p>}
                    {emailError && (
                      <div className="flex items-center gap-2 text-xs text-red-500">
                        <X size={14} />
                        <span>{emailError}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-white">Tipo de conta</Label>
                    <RadioGroup value={tipo} onValueChange={(value) => setTipo(value as "voluntario" | "gestor")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="voluntario" id="voluntario" />
                        <Label htmlFor="voluntario" className="text-white font-normal">
                          Voluntário
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gestor" id="gestor" />
                        <Label htmlFor="gestor" className="text-white font-normal">
                          Gestor
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                        className="bg-zinc-800 border-zinc-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-white">
                      Confirmar senha
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      placeholder="Sua senha confirmada"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <div className="flex flex-col gap-1 text-xs mt-1">
                      <div className="flex items-center gap-2">
                        {passwordHas8Chars ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <X size={14} className="text-red-500" />
                        )}
                        <span className={passwordHas8Chars ? "text-green-500" : "text-zinc-400"}>
                          A senha deve ter pelo menos 8 caracteres
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordsMatch ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <X size={14} className="text-red-500" />
                        )}
                        <span className={passwordsMatch ? "text-green-500" : "text-zinc-400"}>
                          As senhas devem coincidir
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Cadastrando você..." : "Cadastrar"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-zinc-400">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="text-white underline underline-offset-4">
                    Fazer login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
