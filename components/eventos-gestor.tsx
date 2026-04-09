"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

type Evento = {
  id: string
  titulo: string
  descricao: string
  categoria: string
  data: string
  status: string
  created_at: string
}

export default function EventosGestor() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("")
  const [data, setData] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const categorias = [
    { value: "doacoes_variadas", label: "Doações Variadas" },
    { value: "comida", label: "Comida" },
    { value: "vestimenta", label: "Vestimenta" },
    { value: "financeira", label: "Financeira" },
  ]

  useEffect(() => {
    loadEventos()
  }, [])

  const loadEventos = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("eventos").select("*").order("data", { ascending: false })
    if (data) setEventos(data)
  }

  const handleCreateEvento = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("eventos").insert({
      titulo,
      descricao,
      categoria,
      data,
      status: "proximo",
    })

    if (!error) {
      setIsDialogOpen(false)
      setTitulo("")
      setDescricao("")
      setCategoria("")
      setData("")
      loadEventos()
    }

    setIsLoading(false)
  }

  const handleDeleteEvento = async (id: string) => {
    const supabase = createClient()
    await supabase.from("eventos").delete().eq("id", id)
    loadEventos()
  }

  const handleMarcarRealizado = async (id: string) => {
    const supabase = createClient()
    await supabase.from("eventos").update({ status: "realizado" }).eq("id", id)
    loadEventos()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Eventos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Novo Evento</DialogTitle>
              <DialogDescription className="text-zinc-400">Preencha os dados do evento</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEvento} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-white">
                  Título
                </Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-white">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-white">
                  Categoria
                </Label>
                <Select value={categoria} onValueChange={setCategoria} required>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {categorias.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-white">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data" className="text-white">
                  Data
                </Label>
                <Input
                  id="data"
                  type="datetime-local"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Evento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eventos.map((evento) => (
          <Card key={evento.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">{evento.titulo}</CardTitle>
              <CardDescription className="text-zinc-400">
                {new Date(evento.data).toLocaleDateString("pt-BR")} às{" "}
                {new Date(evento.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-zinc-300">{evento.descricao}</p>
              <p className="text-sm text-zinc-400">
                Categoria: {categorias.find((c) => c.value === evento.categoria)?.label}
              </p>
              <p className="text-sm text-zinc-400">Status: {evento.status === "proximo" ? "Futuro" : "Realizado"}</p>
              <div className="flex gap-2 pt-2">
                {evento.status === "proximo" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarcarRealizado(evento.id)}
                    className="flex-1"
                  >
                    Marcar como Realizado
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDeleteEvento(evento.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
