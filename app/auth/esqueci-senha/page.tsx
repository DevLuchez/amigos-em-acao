"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/nova-senha`,
    })

    if (error) {
      setError("Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.")
      setIsLoading(false)
      return
    }

    setEnviado(true)
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-sm">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar para o login
        </Link>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Esqueci minha senha</CardTitle>
            <CardDescription className="text-zinc-400">
              Digite seu e-mail e enviaremos um link para você redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enviado ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-white font-medium">E-mail enviado!</p>
                <p className="text-sm text-zinc-400">
                  Verifique sua caixa de entrada (e o spam) em <span className="text-white">{email}</span>, procure por um e-mail enviado por <span className="text-white">Supabase Auth</span> e clique no link para redefinir sua senha.
                </p>
                <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white underline underline-offset-4 mt-2">
                  Voltar para o login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">
                      E-mail
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
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar link de redefinição"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
