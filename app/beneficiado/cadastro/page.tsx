"use client"

import type React from "react"

import { createBeneficiado } from "@/app/actions/create-beneficiado"
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
  const [endereco, setEndereco] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [complemento, setComplemento] = useState("")
  const [necessidade, setNecessidade] = useState("")
  const [descricao, setDescricao] = useState("")
  const [telefone, setTelefone] = useState("")
  const [nomeError, setNomeError] = useState<string>("")
  const [telefoneError, setTelefoneError] = useState<string>("")
  const [emailError, setEmailError] = useState<string>("")
  const [enderecoError, setEnderecoError] = useState<string>("")
  const [bairroError, setBairroError] = useState<string>("")
  const [cidadeError, setCidadeError] = useState<string>("")
  const [necessidadeError, setNecessidadeError] = useState<string>("")
  const [descricaoError, setDescricaoError] = useState<string>("")
  const [charCount, setCharCount] = useState(0)
  const MAX_DESCRICAO_LENGTH = 250
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    let hasError = false

    if (!nome) { setNomeError("O nome é obrigatório."); hasError = true } else setNomeError("")
    if (!telefone) { setTelefoneError("O telefone é obrigatório."); hasError = true } else if (telefone.length < 14) { setTelefoneError("O telefone deve ser completo (DDD + número)."); hasError = true } else setTelefoneError("")
    if (email && !email.includes("@")) { setEmailError("E-mail inválido."); hasError = true } else setEmailError("")
    if (!endereco) { setEnderecoError("O endereço é obrigatório."); hasError = true } else setEnderecoError("")
    if (!bairro) { setBairroError("O bairro é obrigatório."); hasError = true } else setBairroError("")
    if (!cidade) { setCidadeError("A cidade é obrigatória."); hasError = true } else setCidadeError("")
    if (!necessidade) { setNecessidadeError("Selecione uma necessidade."); hasError = true } else setNecessidadeError("")
    if (!descricao) { setDescricaoError("A descrição é obrigatória."); hasError = true } else setDescricaoError("")

    if (hasError) {
      setIsLoading(false)
      return
    }

    try {
      const result = await createBeneficiado({
        nome,
        email,
        telefone,
        endereco,
        bairro,
        cidade,
        complemento,
        necessidade,
        descricao,
      })

      if (!result.success) {
        setError(result.error || "Erro ao enviar cadastro")
        return
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
                      value={nome}
                      onChange={(e) => { setNome(e.target.value); if (nomeError) setNomeError("") }}
                      placeholder="Seu Nome"
                      className={`bg-zinc-800 border-zinc-700 text-white ${nomeError ? "border-red-500" : ""}`}
                    />
                    {nomeError && <p className="text-xs text-red-400">{nomeError}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefone" className="text-white">
                      Telefone *
                    </Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={(e) => { setTelefone(formatTelefone(e.target.value)); if (telefoneError) setTelefoneError("") }}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className={`bg-zinc-800 border-zinc-700 text-white ${telefoneError ? "border-red-500" : ""}`}
                    />
                    {telefoneError && <p className="text-xs text-red-400">{telefoneError}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError("") }}
                      placeholder="seu@email.com"
                      className={`bg-zinc-800 border-zinc-700 text-white ${emailError ? "border-red-500" : ""}`}
                    />
                    {emailError && <p className="text-xs text-red-400">{emailError}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endereco" className="text-white">
                      Endereço (Rua, Av., etc.) *
                    </Label>
                    <Input
                      id="endereco"
                      type="text"
                      value={endereco}
                      onChange={(e) => { setEndereco(e.target.value); if (enderecoError) setEnderecoError("") }}
                      placeholder="Ex: Rua das Flores, 123"
                      className={`bg-zinc-800 border-zinc-700 text-white ${enderecoError ? "border-red-500" : ""}`}
                    />
                    {enderecoError && <p className="text-xs text-red-400">{enderecoError}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bairro" className="text-white">
                        Bairro *
                      </Label>
                      <Input
                        id="bairro"
                        type="text"
                        value={bairro}
                        onChange={(e) => { setBairro(e.target.value); if (bairroError) setBairroError("") }}
                        placeholder="Ex: Centro"
                        className={`bg-zinc-800 border-zinc-700 text-white ${bairroError ? "border-red-500" : ""}`}
                      />
                      {bairroError && <p className="text-xs text-red-400">{bairroError}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cidade" className="text-white">
                        Cidade *
                      </Label>
                      <Input
                        id="cidade"
                        type="text"
                        value={cidade}
                        onChange={(e) => { setCidade(e.target.value); if (cidadeError) setCidadeError("") }}
                        placeholder="Ex: Jaraguá do Sul"
                        className={`bg-zinc-800 border-zinc-700 text-white ${cidadeError ? "border-red-500" : ""}`}
                      />
                      {cidadeError && <p className="text-xs text-red-400">{cidadeError}</p>}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="complemento" className="text-white">
                      Complemento (Opcional)
                    </Label>
                    <Input
                      id="complemento"
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Ponto de referência "
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="necessidade" className="text-white">
                      O que você precisa? *
                    </Label>
                    <Select value={necessidade} onValueChange={(v) => { setNecessidade(v); if (necessidadeError) setNecessidadeError("") }}>
                      <SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white ${necessidadeError ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="roupas" className="text-white">
                          Roupas
                        </SelectItem>
                        <SelectItem value="moveis" className="text-white">
                          Móveis
                        </SelectItem>
                        <SelectItem value="cesta_basica" className="text-white">
                          Cesta básica
                        </SelectItem>
                        <SelectItem value="outros" className="text-white">
                          Outros
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {necessidadeError && <p className="text-xs text-red-400">{necessidadeError}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="descricao" className="text-white">
                      Descreva sua situação *
                    </Label>
                    <Textarea
                      id="descricao"
                      placeholder="Conte-nos mais sobre sua necessidade e situação..."
                      value={descricao}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_DESCRICAO_LENGTH) {
                          setDescricao(e.target.value)
                          setCharCount(e.target.value.length)
                          if (descricaoError) setDescricaoError("")
                        }
                      }}
                      className={`bg-zinc-800 border-zinc-700 text-white min-h-[120px] ${descricaoError ? "border-red-500" : ""}`}
                      maxLength={MAX_DESCRICAO_LENGTH}
                    />
                    {descricaoError && <p className="text-xs text-red-400">{descricaoError}</p>}
                    <p className="text-xs text-zinc-400 text-right">
                      {charCount} / {MAX_DESCRICAO_LENGTH} caracteres
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Solicitando ajuda..." : "Enviar"}
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
