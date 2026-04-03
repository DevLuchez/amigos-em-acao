"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"

export default function BeneficiadoCadastroPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cep, setCep] = useState("")
  const [necessidade, setNecessidade] = useState("")
  const [descricao, setDescricao] = useState("")
  const [charCount, setCharCount] = useState(0)
  const MAX_DESCRICAO_LENGTH = 250
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validandoCep, setValidandoCep] = useState(false)
  const router = useRouter()

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value)
    setCep(formatted)
  }

  const validarCep = async (cepValue: string): Promise<boolean> => {
    const cepNumbers = cepValue.replace(/\D/g, "")
    if (cepNumbers.length !== 8) return false

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`)
      const data = await response.json()
      return !data.erro
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    setValidandoCep(true)
    const cepValido = await validarCep(cep)
    setValidandoCep(false)

    if (!cepValido) {
      setError("CEP inválido. Por favor, verifique o CEP informado.")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { data: beneficiadoData, error: beneficiadoError } = await supabase
        .from("beneficiados")
        .insert({
          nome,
          email,
          cep,
          necessidade,
          descricao,
        })
        .select()
        .single()

      if (beneficiadoError) throw beneficiadoError

      const { error: solicitacaoError } = await supabase.from("solicitacoes_ajuda").insert({
        beneficiado_id: beneficiadoData.id,
        status: "nova",
        prioridade: "media", // Prioridade padrão
      })

      if (solicitacaoError) {
        console.error("[v0] Erro ao criar solicitação:", solicitacaoError)
        // Mesmo com erro na solicitação, continua o fluxo pois o beneficiado foi cadastrado
      }

      router.push("/beneficiado/sucesso")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao enviar cadastro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para página inicial</span>
          </Link>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Procuro Ajuda</CardTitle>
              <CardDescription className="text-zinc-400">
                Preencha o formulário abaixo e entraremos em contato o mais rápido possível
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome" className="text-white">
                      Nome completo *
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
                    <Label htmlFor="email" className="text-white">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cep" className="text-white">
                      CEP *
                    </Label>
                    <Input
                      id="cep"
                      type="text"
                      required
                      value={cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="necessidade" className="text-white">
                      O que você precisa? *
                    </Label>
                    <Select value={necessidade} onValueChange={setNecessidade} required>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="financas" className="text-white">
                          Finanças
                        </SelectItem>
                        <SelectItem value="alimentos" className="text-white">
                          Alimentos
                        </SelectItem>
                        <SelectItem value="vestimentas" className="text-white">
                          Vestimentas
                        </SelectItem>
                        <SelectItem value="outros" className="text-white">
                          Outros
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="descricao" className="text-white">
                      Descreva sua situação *
                    </Label>
                    <Textarea
                      id="descricao"
                      placeholder="Conte-nos mais sobre sua necessidade e situação..."
                      required
                      value={descricao}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_DESCRICAO_LENGTH) {
                          setDescricao(e.target.value)
                          setCharCount(e.target.value.length)
                        }
                      }}
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
                      maxLength={MAX_DESCRICAO_LENGTH}
                    />
                    <p className="text-xs text-zinc-400 text-right">
                      {charCount} / {MAX_DESCRICAO_LENGTH} caracteres
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading || validandoCep}>
                    {validandoCep ? "Validando CEP..." : isLoading ? "Solicitando ajuda..." : "Enviar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
