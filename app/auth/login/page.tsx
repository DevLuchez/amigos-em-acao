"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { loginAction } from "./actions"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginAction(email, password)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // Se não houver erro, a Server Action já fez o redirect
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        // O Next.js usa esse erro internamente para fazer o redirect, então apenas ignoramos
        return
      }
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-sm">
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
              <CardTitle className="text-2xl text-white">Login</CardTitle>
              <CardDescription className="text-zinc-400">
                Entre com seu email e senha para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
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
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <div className="text-right">
                      <Link
                        href="/auth/esqueci-senha"
                        className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
                      >
                        Esqueceu sua senha?
                      </Link>
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-zinc-400">
                  Não tem uma conta?{" "}
                  <Link href="/auth/cadastro" className="text-white underline underline-offset-4">
                    Cadastre-se
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
