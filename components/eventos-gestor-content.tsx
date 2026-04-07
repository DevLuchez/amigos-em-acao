"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,

} from "@/components/ui/dialog"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { DateTimeInput } from "@/components/ui/datetime-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Calendar, Edit, Eye, MoreVertical, Copy, X, CheckSquare, Search } from "lucide-react"
import { getStatusEvento, formatEventoDateTime } from "@/lib/utils/evento-utils"
import { stringContains } from "@/lib/utils/string-utils"
import { notifyVolunteersAboutEvent } from "@/app/actions/notify-volunteers"
type Evento = {
  id: string
  titulo: string
  descricao: string
  categoria: string
  data: string
  status: string
  publico: boolean
  created_at: string
  voluntarios_inscritos?: number
  quantidade_minima_voluntarios: number
  quantidade_maxima_voluntarios: number | null
}

export default function EventosGestorContent() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventoToDelete, setEventoToDelete] = useState<string | null>(null)
  const [eventoToEdit, setEventoToEdit] = useState<Evento | null>(null)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("")
  const [data, setData] = useState("")
  const [publico, setPublico] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("agendados")
  const [descricaoDialogOpen, setDescricaoDialogOpen] = useState(false)
  const [descricaoCompleta, setDescricaoCompleta] = useState("")
  const [charCount, setCharCount] = useState(0)
  const MAX_DESCRICAO_LENGTH = 250
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [eventoToDuplicate, setEventoToDuplicate] = useState<Evento | null>(null)

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedEventos, setSelectedEventos] = useState<string[]>([])
  const [deleteMultipleDialogOpen, setDeleteMultipleDialogOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")

  const [quantidadeMinima, setQuantidadeMinima] = useState<string>("")
  const [quantidadeMaxima, setQuantidadeMaxima] = useState<string>("")
  const [qtdMaxError, setQtdMaxError] = useState<string>("")
  const [tituloError, setTituloError] = useState<string>("")
  const [categoriaError, setCategoriaError] = useState<string>("")
  const [categoriaOutros, setCategoriaOutros] = useState<string>("")
  const [categoriaOutrosError, setCategoriaOutrosError] = useState<string>("")
  const [dataError, setDataError] = useState<string>("")
  const [qtdMinError, setQtdMinError] = useState<string>("")

  const categorias = [
    { value: "acao_social", label: "Ação Social" },
    { value: "arrecadacao_mercados", label: "Arrecadação variada em Mercados" },
    { value: "entrega_cesta_basica", label: "Entrega de cesta básica" },
    { value: "campanha_feijoada", label: "Campanha da Feijoada" },
    { value: "campanha_agasalho", label: "Campanha do Agasalho" },
    { value: "campanha_natal", label: "Campanha de Natal" },
    { value: "outros", label: "Outros" },
  ]

  useEffect(() => {
    loadEventos()
  }, [])

  const loadEventos = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("eventos").select("*").order("data", { ascending: false })

    if (data) {
      const eventosComContagem = await Promise.all(
        data.map(async (evento) => {
          const { count } = await supabase
            .from("participacoes_eventos")
            .select("*", { count: "exact", head: true })
            .eq("evento_id", evento.id)

          return {
            ...evento,
            voluntarios_inscritos: count || 0,
          }
        }),
      )

      setEventos(eventosComContagem)
    }
  }

  const handleCreateEvento = async (e: React.FormEvent) => {
    e.preventDefault()

    const qtdMinima = quantidadeMinima ? Number.parseInt(quantidadeMinima) : 0
    const qtdMaxima = quantidadeMaxima ? Number.parseInt(quantidadeMaxima) : null

    if (qtdMaxima !== null && qtdMaxima < qtdMinima) {
      setQtdMaxError("A quantidade máxima não pode ser menor que a quantidade mínima.")
      return
    }
    setQtdMaxError("")

    let hasError = false
    if (!titulo) { setTituloError("O título é obrigatório."); hasError = true } else setTituloError("")
    const categoriaFinal = categoria === "outros" ? categoriaOutros.trim() : categoria;
    if (!categoria) { 
      setCategoriaError("Selecione uma categoria."); 
      hasError = true 
    } else if (categoria === "outros" && !categoriaOutros.trim()) { 
      setCategoriaOutrosError("Especifique a categoria."); 
      hasError = true 
    } else { 
      setCategoriaError(""); 
      setCategoriaOutrosError("") 
    }
    if (!data) { setDataError("Informe a data e hora do evento."); hasError = true } else setDataError("")
    if (qtdMinima <= 0) { setQtdMinError("Deve ser maior que zero."); hasError = true } else setQtdMinError("")
    if (hasError) return

    setIsLoading(true)

    const supabase = createClient()

    const { data: insertedEvento, error } = await supabase.from("eventos").insert({
      titulo,
      descricao,
      categoria: categoriaFinal,
      data,
      publico,
      quantidade_minima_voluntarios: qtdMinima,
      quantidade_maxima_voluntarios: quantidadeMaxima ? Number.parseInt(quantidadeMaxima) : null,
    }).select().single()

    if (!error) {
      setIsDialogOpen(false)
      
      // Disparar o envio de E-mails se o evento for FUTURO
      if (new Date(data) > new Date()) {
        notifyVolunteersAboutEvent({
          id: insertedEvento.id,
          titulo: insertedEvento.titulo,
          descricao: insertedEvento.descricao,
          categoria: insertedEvento.categoria,
          data: insertedEvento.data
        }).catch((err: any) => console.error("Erro ao notificar voluntários:", err));
      }

      setTituloError(""); setCategoriaError(""); setDataError(""); setQtdMinError(""); setQtdMaxError("")
      setTitulo("")
      setDescricao("")
      setCategoria("")
      setData("")
      setPublico(false)
      setQuantidadeMinima("")
      setQuantidadeMaxima("")
      loadEventos()
    }

    setIsLoading(false)
  }

  const handleEditEvento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventoToEdit) return

    const qtdMinima = quantidadeMinima ? Number.parseInt(quantidadeMinima) : 0
    const qtdMaxima = quantidadeMaxima ? Number.parseInt(quantidadeMaxima) : null

    if (qtdMaxima !== null && qtdMaxima < qtdMinima) {
      setQtdMaxError("A quantidade máxima não pode ser menor que a quantidade mínima.")
      return
    }
    setQtdMaxError("")

    let hasError = false
    if (!titulo) { setTituloError("O título é obrigatório."); hasError = true } else setTituloError("")
    const categoriaFinal = categoria === "outros" ? categoriaOutros.trim() : categoria;
    if (!categoria) { 
      setCategoriaError("Selecione uma categoria."); 
      hasError = true 
    } else if (categoria === "outros" && !categoriaOutros.trim()) { 
      setCategoriaOutrosError("Especifique a categoria."); 
      hasError = true 
    } else { 
      setCategoriaError(""); 
      setCategoriaOutrosError("") 
    }
    if (!data) { setDataError("Informe a data e hora do evento."); hasError = true } else setDataError("")
    if (qtdMinima <= 0) { setQtdMinError("Deve ser maior que zero."); hasError = true } else setQtdMinError("")
    if (hasError) return

    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from("eventos")
      .update({
        titulo,
        descricao,
        categoria: categoriaFinal,
        data,
        publico,
        quantidade_minima_voluntarios: qtdMinima,
        quantidade_maxima_voluntarios: quantidadeMaxima ? Number.parseInt(quantidadeMaxima) : null,
      })
      .eq("id", eventoToEdit.id)

    if (!error) {
      if (new Date(data) > new Date()) {
        notifyVolunteersAboutEvent({
          id: eventoToEdit.id,
          titulo,
          descricao,
          categoria: categoriaFinal,
          data
        }, "atualizado").catch((err: any) => console.error("Erro ao notificar voluntários na edição:", err));
      }
      setIsEditDialogOpen(false)
      setEventoToEdit(null)
      setTituloError(""); setCategoriaError(""); setDataError(""); setQtdMinError(""); setQtdMaxError("")
      setTitulo("")
      setDescricao("")
      setCategoria("")
      setData("")
      setPublico(false)
      setQuantidadeMinima("")
      setQuantidadeMaxima("")
      loadEventos()
    }

    setIsLoading(false)
  }

  const handleTogglePublico = async (id: string, currentPublico: boolean) => {
    const supabase = createClient()
    await supabase.from("eventos").update({ publico: !currentPublico }).eq("id", id)
    loadEventos()
  }

  const confirmDelete = (id: string) => {
    setEventoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteEvento = async () => {
    if (!eventoToDelete) return
    setIsLoading(true)
    const evento = eventos.find(e => e.id === eventoToDelete)
    const supabase = createClient()
    const { error } = await supabase.from("eventos").delete().eq("id", eventoToDelete)
    
    if (!error) {
      if (evento && new Date(evento.data) > new Date()) {
        notifyVolunteersAboutEvent({
          id: evento.id,
          titulo: evento.titulo,
          descricao: evento.descricao,
          categoria: evento.categoria,
          data: evento.data
        }, "excluido").catch((err: any) => console.error("Erro ao notificar cancelamento:", err));
      }
      setDeleteDialogOpen(false)
      setEventoToDelete(null)
      loadEventos()
    }
    setIsLoading(false)
  }

  const handleMarcarRealizado = async (id: string) => {
    const supabase = createClient()
    await supabase.from("eventos").update({ status: "realizado" }).eq("id", id)
    loadEventos()
  }

  const openEditDialog = (evento: Evento) => {
    setEventoToEdit(evento)
    setTitulo(evento.titulo)
    setDescricao(evento.descricao)
    setCharCount(evento.descricao.length)
    const isCustomCategoria = !categorias.some(c => c.value === evento.categoria)
    setCategoria(isCustomCategoria ? "outros" : evento.categoria)
    setCategoriaOutros(isCustomCategoria ? evento.categoria : "")
    setData(formatDateForInput(evento.data))
    setPublico(evento.publico)
    setQuantidadeMinima(evento.quantidade_minima_voluntarios.toString())
    setQuantidadeMaxima(evento.quantidade_maxima_voluntarios?.toString() || "")
    setIsEditDialogOpen(true)
  }

  const openDescricaoDialog = (descricao: string) => {
    setDescricaoCompleta(descricao)
    setDescricaoDialogOpen(true)
  }

  const handleDuplicateEvento = async (e: React.FormEvent) => {
    e.preventDefault()

    const qtdMinima = quantidadeMinima ? Number.parseInt(quantidadeMinima) : 0
    const qtdMaxima = quantidadeMaxima ? Number.parseInt(quantidadeMaxima) : null

    if (qtdMaxima !== null && qtdMaxima < qtdMinima) {
      setQtdMaxError("A quantidade máxima não pode ser menor que a quantidade mínima.")
      return
    }
    setQtdMaxError("")

    let hasError = false
    if (!titulo) { setTituloError("O título é obrigatório."); hasError = true } else setTituloError("")
    const categoriaFinal = categoria === "outros" ? categoriaOutros.trim() : categoria;
    if (!categoria) { 
      setCategoriaError("Selecione uma categoria."); 
      hasError = true 
    } else if (categoria === "outros" && !categoriaOutros.trim()) { 
      setCategoriaOutrosError("Especifique a categoria."); 
      hasError = true 
    } else { 
      setCategoriaError(""); 
      setCategoriaOutrosError("") 
    }
    if (!data) { setDataError("Informe a data e hora do evento."); hasError = true } else setDataError("")
    if (qtdMinima <= 0) { setQtdMinError("Deve ser maior que zero."); hasError = true } else setQtdMinError("")
    if (hasError) return

    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.from("eventos").insert({
      titulo,
      descricao,
      categoria: categoriaFinal,
      data,
      publico,
      quantidade_minima_voluntarios: qtdMinima,
      quantidade_maxima_voluntarios: quantidadeMaxima ? Number.parseInt(quantidadeMaxima) : null,
    })

    if (!error) {
      setIsDuplicateDialogOpen(false)
      setEventoToDuplicate(null)
      setTituloError(""); setCategoriaError(""); setDataError(""); setQtdMinError(""); setQtdMaxError("")
      setTitulo("")
      setDescricao("")
      setCategoria("")
      setData("")
      setPublico(false)
      setQuantidadeMinima("")
      setQuantidadeMaxima("")
      loadEventos()
    }

    setIsLoading(false)
  }

  const openDuplicateDialog = (evento: Evento) => {
    setEventoToDuplicate(evento)
    setTitulo(`${evento.titulo} (Cópia)`)
    setDescricao(evento.descricao)
    setCharCount(evento.descricao.length)
    const isCustomCategoria = !categorias.some(c => c.value === evento.categoria)
    setCategoria(isCustomCategoria ? "outros" : evento.categoria)
    setCategoriaOutros(isCustomCategoria ? evento.categoria : "")
    setData(formatDateForInput(evento.data))
    setPublico(evento.publico)
    setQuantidadeMinima(evento.quantidade_minima_voluntarios.toString())
    setQuantidadeMaxima(evento.quantidade_maxima_voluntarios?.toString() || "")
    setIsDuplicateDialogOpen(true)
  }

  const formatDateForInput = (isoDate: string): string => {
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    if (match) {
      const [, year, month, day, hours, minutes] = match
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const enterSelectionMode = () => {
    setIsSelectionMode(true)
    setSelectedEventos([])
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedEventos([])
  }

  const toggleEventoSelection = (id: string) => {
    setSelectedEventos((prev) => (prev.includes(id) ? prev.filter((eventoId) => eventoId !== id) : [...prev, id]))
  }

  const confirmDeleteMultiple = () => {
    if (selectedEventos.length === 0) return
    setDeleteMultipleDialogOpen(true)
  }

  const handleDeleteMultipleEventos = async () => {
    if (selectedEventos.length === 0) return

    const supabase = createClient()

    // Deletar todos os eventos selecionados
    await Promise.all(selectedEventos.map((id) => supabase.from("eventos").delete().eq("id", id)))

    setDeleteMultipleDialogOpen(false)
    exitSelectionMode()
    loadEventos()
  }

  const filterEventos = (eventos: Evento[]) => {
    let filtered = eventos

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter((evento) => stringContains(evento.titulo, searchTerm))
    }

    // Ordenação por data já vem do banco (mais recente primeiro)
    return filtered
  }

  const todosEventos = filterEventos(eventos)
  const eventosRealizados = filterEventos(eventos.filter((e) => getStatusEvento(e.data) === "realizado"))
  const eventosAgendados = filterEventos(eventos.filter((e) => getStatusEvento(e.data) === "proximo"))

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-black pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Gerenciar Eventos</h2>
            <p className="text-zinc-400 mt-1">Gerencie e acompanhe todos os eventos da organização</p>
          </div>

          {isSelectionMode ? (
            <div className="flex gap-2">
              <Button
                onClick={exitSelectionMode}
                variant="outline"
                className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={confirmDeleteMultiple}
                disabled={selectedEventos.length === 0}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Selecionados ({selectedEventos.length})
              </Button>
            </div>
          ) : (
            <Button
              className="bg-white text-black hover:bg-zinc-200"
              onClick={() => {
                setTitulo("")
                setDescricao("")
                setCharCount(0)
                setCategoria("")
                setCategoriaOutros("")
                setData("")
                setPublico(false)
                setQuantidadeMinima("")
                setQuantidadeMaxima("")
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agendar Novo Evento
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-zinc-900">
            <TabsTrigger value="todos" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Todos os Eventos ({todosEventos.length})
            </TabsTrigger>
            <TabsTrigger value="agendados" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Eventos Futuros ({eventosAgendados.length})
            </TabsTrigger>
            <TabsTrigger value="realizados" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Eventos Realizados ({eventosRealizados.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar eventos por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
          </div>
        </Tabs>
      </div>

      <Dialog open={descricaoDialogOpen} onOpenChange={setDescricaoDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Descrição Completa</DialogTitle>
          </DialogHeader>
          <div className="text-zinc-300 whitespace-pre-wrap">{descricaoCompleta}</div>
        </DialogContent>
      </Dialog>

      {/* Dialog de criar evento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Agendar Novo Evento</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Preencha os dados do evento. Eventos públicos aparecerão na landing page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEvento} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-white">
                Título *
              </Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => { setTitulo(e.target.value); if (tituloError) setTituloError("") }}
                className={`bg-zinc-800 border-zinc-700 text-white ${tituloError ? "border-red-500" : ""}`}
                placeholder="Ex: Campanha de Arrecadação de Alimentos"
              />
              {tituloError && <p className="text-xs text-red-400">{tituloError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-white">
                Breve Descrição
              </Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRICAO_LENGTH) {
                    setDescricao(e.target.value)
                    setCharCount(e.target.value.length)
                  }
                }}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Descreva brevemente o evento..."
                rows={3}
                maxLength={MAX_DESCRICAO_LENGTH}
              />
              <p className="text-xs text-zinc-400 text-right">
                {charCount} / {MAX_DESCRICAO_LENGTH}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-white">
                  Categoria *
                </Label>
                <Select value={categoria} onValueChange={(v) => { setCategoria(v); if (categoriaError) setCategoriaError(""); setCategoriaOutrosError(""); }}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white ${categoriaError ? "border-red-500" : ""}`}>
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
                {categoriaError && <p className="text-xs text-red-400">{categoriaError}</p>}
                {categoria === "outros" && (
                  <div className="mt-2 space-y-2">
                    <Input
                      id="categoria-outros"
                      type="text"
                      placeholder="Especifique a categoria"
                      value={categoriaOutros}
                      onChange={(e) => { 
                        if (e.target.value.length <= 20) {
                          setCategoriaOutros(e.target.value); 
                          if (categoriaOutrosError) setCategoriaOutrosError("");
                        }
                      }}
                      className={`bg-zinc-800 border-zinc-700 text-white ${categoriaOutrosError ? "border-red-500" : ""}`}
                      maxLength={20}
                    />
                    {categoriaOutrosError && <p className="text-xs text-red-400">{categoriaOutrosError}</p>}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="data" className="text-white">
                  Data e Hora *
                </Label>
                <DateTimeInput
                  id="data"
                  value={data}
                  onChange={(v) => { setData(v); if (dataError) setDataError("") }}
                  className={`bg-zinc-800 border-zinc-700 text-white ${dataError ? "border-red-500" : ""}`}
                />
                {dataError && <p className="text-xs text-red-400">{dataError}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade-minima-2" className="text-white">
                  Qtde Mínima de Voluntários *
                </Label>
                <Input
                  id="quantidade-minima-2"
                  name="quantidade-minima-2"
                  type="text"
                  inputMode="numeric"
                  value={quantidadeMinima}
                  onChange={(e) => { setQuantidadeMinima(e.target.value.replace(/\D/g, "")); if (qtdMinError) setQtdMinError("") }}
                  className={`bg-zinc-800 border-zinc-700 text-white ${qtdMinError ? "border-red-500" : ""}`}
                  placeholder="Ex: 10"
                />
                {qtdMinError && <p className="text-xs text-red-400">{qtdMinError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade-maxima-2" className="text-white">
                  Qtde Máxima de Voluntários (Opcional)
                </Label>
                <Input
                  id="quantidade-maxima-2"
                  name="quantidade-maxima-2"
                  type="text"
                  inputMode="numeric"
                  value={quantidadeMaxima}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, "")
                    setQuantidadeMaxima(cleanValue)
                    const min = quantidadeMinima ? Number.parseInt(quantidadeMinima) : 0
                    const max = cleanValue ? Number.parseInt(cleanValue) : null
                    if (max !== null && max < min) {
                      setQtdMaxError("A quantidade máxima não pode ser menor que a quantidade mínima.")
                    } else {
                      setQtdMaxError("")
                    }
                  }}
                  className={`bg-zinc-800 border-zinc-700 text-white ${qtdMaxError ? "border-red-500" : ""}`}
                  placeholder="Deixe vazio para ilimitado"
                />
                {qtdMaxError && (
                  <p className="text-xs text-red-400">{qtdMaxError}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-zinc-700 p-4 bg-zinc-800">
              <div className="space-y-0.5">
                <Label htmlFor="publico" className="text-white cursor-pointer">
                  Evento Público
                </Label>
                <p className="text-sm text-zinc-400">Visível na página pública de eventos</p>
              </div>
              <Switch
                id="publico"
                checked={publico}
                onCheckedChange={setPublico}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Evento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de editar evento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Evento</DialogTitle>
            <DialogDescription className="text-zinc-400">Edite os dados do evento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEvento} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-titulo" className="text-white">
                Título *
              </Label>
              <Input
                id="edit-titulo"
                value={titulo}
                onChange={(e) => { setTitulo(e.target.value); if (tituloError) setTituloError("") }}
                className={`bg-zinc-800 border-zinc-700 text-white ${tituloError ? "border-red-500" : ""}`}
              />
              {tituloError && <p className="text-xs text-red-400">{tituloError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descricao" className="text-white">
                Breve Descrição
              </Label>
              <Textarea
                id="edit-descricao"
                value={descricao}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRICAO_LENGTH) {
                    setDescricao(e.target.value)
                    setCharCount(e.target.value.length)
                  }
                }}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
                maxLength={MAX_DESCRICAO_LENGTH}
              />
              <p className="text-xs text-zinc-400 text-right">
                {charCount} / {MAX_DESCRICAO_LENGTH}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-categoria" className="text-white">
                  Categoria *
                </Label>
                <Select value={categoria} onValueChange={(v) => { setCategoria(v); if (categoriaError) setCategoriaError(""); setCategoriaOutrosError(""); }}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white ${categoriaError ? "border-red-500" : ""}`}>
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
                {categoriaError && <p className="text-xs text-red-400">{categoriaError}</p>}
                {categoria === "outros" && (
                  <div className="mt-2 space-y-2">
                    <Input
                      id="edit-categoria-outros"
                      type="text"
                      placeholder="Especifique a categoria"
                      value={categoriaOutros}
                      onChange={(e) => { 
                        if (e.target.value.length <= 20) {
                          setCategoriaOutros(e.target.value); 
                          if (categoriaOutrosError) setCategoriaOutrosError("");
                        }
                      }}
                      className={`bg-zinc-800 border-zinc-700 text-white ${categoriaOutrosError ? "border-red-500" : ""}`}
                      maxLength={20}
                    />
                    {categoriaOutrosError && <p className="text-xs text-red-400">{categoriaOutrosError}</p>}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-data" className="text-white">
                  Data e Hora *
                </Label>
                <DateTimeInput
                  id="edit-data"
                  value={data}
                  onChange={(v) => { setData(v); if (dataError) setDataError("") }}
                  className={`bg-zinc-800 border-zinc-700 text-white ${dataError ? "border-red-500" : ""}`}
                />
                {dataError && <p className="text-xs text-red-400">{dataError}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantidade-minima-2" className="text-white">
                  Qtde Mínima de Voluntários *
                </Label>
                <Input
                  id="edit-quantidade-minima-2"
                  name="edit-quantidade-minima-2"
                  type="text"
                  inputMode="numeric"
                  value={quantidadeMinima}
                  onChange={(e) => { setQuantidadeMinima(e.target.value.replace(/\D/g, "")); if (qtdMinError) setQtdMinError("") }}
                  className={`bg-zinc-800 border-zinc-700 text-white ${qtdMinError ? "border-red-500" : ""}`}
                  placeholder="Ex: 10"
                />
                {qtdMinError && <p className="text-xs text-red-400">{qtdMinError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantidade-maxima-2" className="text-white">
                  Qtde Máxima de Voluntários (Opcional)
                </Label>
                <Input
                  id="edit-quantidade-maxima-2"
                  name="edit-quantidade-maxima-2"
                  type="text"
                  inputMode="numeric"
                  value={quantidadeMaxima}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, "")
                    setQuantidadeMaxima(cleanValue)
                    const min = quantidadeMinima ? Number.parseInt(quantidadeMinima) : 0
                    const max = cleanValue ? Number.parseInt(cleanValue) : null
                    if (max !== null && max < min) {
                      setQtdMaxError("A quantidade máxima não pode ser menor que a quantidade mínima.")
                    } else {
                      setQtdMaxError("")
                    }
                  }}
                  className={`bg-zinc-800 border-zinc-700 text-white ${qtdMaxError ? "border-red-500" : ""}`}
                  placeholder="Deixe vazio para ilimitado"
                />
                {qtdMaxError && (
                  <p className="text-xs text-red-400">{qtdMaxError}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-zinc-700 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-publico" className="text-white font-medium">
                  Disponibilizar para todos
                </Label>
                <p className="text-sm text-zinc-400">
                  Se ativado, o evento aparecerá na landing page para atrair novos voluntários
                </p>
              </div>
              <Switch id="edit-publico" checked={publico} onCheckedChange={setPublico} />
            </div>

            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvento} className="bg-red-500 text-white hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteMultipleDialogOpen} onOpenChange={setDeleteMultipleDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão Múltipla</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir {selectedEventos.length} evento(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMultipleEventos} className="bg-red-500 text-white hover:bg-red-600">
              Excluir {selectedEventos.length} Evento(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Duplicar Evento</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Edite os dados do evento duplicado antes de salvar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDuplicateEvento} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dup-titulo" className="text-white">
                Título *
              </Label>
              <Input
                id="dup-titulo"
                value={titulo}
                onChange={(e) => { setTitulo(e.target.value); if (tituloError) setTituloError("") }}
                className={`bg-zinc-800 border-zinc-700 text-white ${tituloError ? "border-red-500" : ""}`}
              />
              {tituloError && <p className="text-xs text-red-400">{tituloError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dup-descricao" className="text-white">
                Breve Descrição
              </Label>
              <Textarea
                id="dup-descricao"
                value={descricao}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRICAO_LENGTH) {
                    setDescricao(e.target.value)
                    setCharCount(e.target.value.length)
                  }
                }}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
                maxLength={MAX_DESCRICAO_LENGTH}
              />
              <p className="text-xs text-zinc-400 text-right">
                {charCount} / {MAX_DESCRICAO_LENGTH}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dup-categoria" className="text-white">
                  Categoria *
                </Label>
                <Select value={categoria} onValueChange={(v) => { setCategoria(v); if (categoriaError) setCategoriaError(""); setCategoriaOutrosError(""); }}>
                  <SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white ${categoriaError ? "border-red-500" : ""}`}>
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
                {categoriaError && <p className="text-xs text-red-400">{categoriaError}</p>}
                {categoria === "outros" && (
                  <div className="mt-2 space-y-2">
                    <Input
                      id="dup-categoria-outros"
                      type="text"
                      placeholder="Especifique a categoria"
                      value={categoriaOutros}
                      onChange={(e) => { 
                        if (e.target.value.length <= 20) {
                          setCategoriaOutros(e.target.value); 
                          if (categoriaOutrosError) setCategoriaOutrosError("");
                        }
                      }}
                      className={`bg-zinc-800 border-zinc-700 text-white ${categoriaOutrosError ? "border-red-500" : ""}`}
                      maxLength={20}
                    />
                    {categoriaOutrosError && <p className="text-xs text-red-400">{categoriaOutrosError}</p>}
                  </div>
                )}
              </div>
                <div className="space-y-2">
                  <Label htmlFor="dup-data" className="text-white">
                    Data e Hora *
                  </Label>
                  <DateTimeInput
                    id="dup-data"
                    value={data}
                    onChange={(v) => { setData(v); if (dataError) setDataError("") }}
                    className={`bg-zinc-800 border-zinc-700 text-white ${dataError ? "border-red-500" : ""}`}
                  />
                  {dataError && <p className="text-xs text-red-400">{dataError}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dup-quantidade-minima" className="text-white">
                  Qtde Mínima de Voluntários *
                </Label>
                <Input
                  id="dup-quantidade-minima"
                  name="dup-quantidade-minima"
                  type="text"
                  inputMode="numeric"
                  value={quantidadeMinima}
                  onChange={(e) => { setQuantidadeMinima(e.target.value.replace(/\D/g, "")); if (qtdMinError) setQtdMinError("") }}
                  className={`bg-zinc-800 border-zinc-700 text-white ${qtdMinError ? "border-red-500" : ""}`}
                  placeholder="Ex: 10"
                />
                {qtdMinError && <p className="text-xs text-red-400">{qtdMinError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dup-quantidade-maxima" className="text-white">
                  Qtde Máxima de Voluntários (Opcional)
                </Label>
                <Input
                  id="dup-quantidade-maxima"
                  name="dup-quantidade-maxima"
                  type="text"
                  inputMode="numeric"
                  value={quantidadeMaxima}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, "")
                    setQuantidadeMaxima(cleanValue)
                    const min = quantidadeMinima ? Number.parseInt(quantidadeMinima) : 0
                    const max = cleanValue ? Number.parseInt(cleanValue) : null
                    if (max !== null && max < min) {
                      setQtdMaxError("A quantidade máxima não pode ser menor que a quantidade mínima.")
                    } else {
                      setQtdMaxError("")
                    }
                  }}
                  className={`bg-zinc-800 border-zinc-700 text-white ${qtdMaxError ? "border-red-500" : ""}`}
                  placeholder="Deixe vazio para ilimitado"
                />
                {qtdMaxError && (
                  <p className="text-xs text-red-400">{qtdMaxError}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-zinc-700 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="dup-publico" className="text-white font-medium">
                  Disponibilizar para todos
                </Label>
                <p className="text-sm text-zinc-400">
                  Se ativado, o evento aparecerá na landing page para atrair novos voluntários
                </p>
              </div>
              <Switch id="dup-publico" checked={publico} onCheckedChange={setPublico} />
            </div>

            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={isLoading}>
              {isLoading ? "Duplicando..." : "Duplicar Evento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabs de eventos */}
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="todos" className="mt-0">
          {todosEventos.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12">
                <p className="text-zinc-400 text-center">Nenhum evento cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todosEventos.map((evento) => {
                const { date, time } = formatEventoDateTime(evento.data)
                const descricaoCurta = evento.descricao.length > 100
                const status = getStatusEvento(evento.data)
                const isSelected = selectedEventos.includes(evento.id)

                return (
                  <Card
                    key={evento.id}
                    className={`bg-zinc-900 border-zinc-800 relative ${isSelected ? "ring-2 ring-white" : ""}`}
                  >
                    {isSelectionMode ? (
                      <div className="absolute top-4 right-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleEventoSelection(evento.id)}
                          className="h-5 w-5 border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(evento)}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDuplicateDialog(evento)}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={enterSelectionMode}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Selecionar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmDelete(evento.id)}
                              className="text-red-400 hover:bg-zinc-700 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-white text-lg pr-8">{evento.titulo}</CardTitle>
                      <CardDescription className="text-zinc-400 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {date} às {time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-zinc-300">
                          {descricaoCurta ? `${evento.descricao.substring(0, 100)}... ` : evento.descricao}
                          {descricaoCurta && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => openDescricaoDialog(evento.descricao)}
                              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                            >
                              Ver mais
                            </Button>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center pt-2">
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                          {categorias.find((c) => c.value === evento.categoria)?.label || evento.categoria}
                        </span>
                        {status === "proximo" ? (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Futuro
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            Realizado
                          </Badge>
                        )}
                        {evento.publico && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Público</span>
                        )}
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                          {evento.voluntarios_inscritos || 0} voluntário(s)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="agendados" className="mt-0">
          {eventosAgendados.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12">
                <p className="text-zinc-400 text-center">Nenhum evento agendado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eventosAgendados.map((evento) => {
                const { date, time } = formatEventoDateTime(evento.data)
                const descricaoCurta = evento.descricao.length > 100
                const isSelected = selectedEventos.includes(evento.id)

                return (
                  <Card
                    key={evento.id}
                    className={`bg-zinc-900 border-zinc-800 relative ${isSelected ? "ring-2 ring-white" : ""}`}
                  >
                    {isSelectionMode ? (
                      <div className="absolute top-4 right-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleEventoSelection(evento.id)}
                          className="h-5 w-5 border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(evento)}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDuplicateDialog(evento)}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={enterSelectionMode}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Selecionar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmDelete(evento.id)}
                              className="text-red-400 hover:bg-zinc-700 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-white text-lg pr-8">{evento.titulo}</CardTitle>
                      <CardDescription className="text-zinc-400 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {date} às {time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-zinc-300">
                          {descricaoCurta ? `${evento.descricao.substring(0, 100)}...` : evento.descricao}
                        </p>
                        {descricaoCurta && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => openDescricaoDialog(evento.descricao)}
                            className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver mais
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center pt-2">
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                          {categorias.find((c) => c.value === evento.categoria)?.label}
                        </span>
                        {evento.publico && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Público</span>
                        )}
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          {evento.voluntarios_inscritos || 0} voluntário(s)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="realizados" className="mt-0">
          {eventosRealizados.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12">
                <p className="text-zinc-400 text-center">Nenhum evento realizado ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eventosRealizados.map((evento) => {
                const { date, time } = formatEventoDateTime(evento.data)
                const descricaoCurta = evento.descricao.length > 100
                const isSelected = selectedEventos.includes(evento.id)

                return (
                  <Card
                    key={evento.id}
                    className={`bg-zinc-900 border-zinc-800 opacity-75 relative ${isSelected ? "ring-2 ring-white" : ""}`}
                  >
                    {isSelectionMode ? (
                      <div className="absolute top-4 right-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleEventoSelection(evento.id)}
                          className="h-5 w-5 border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(evento)}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDuplicateDialog(evento)}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={enterSelectionMode}
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                            >
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Selecionar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmDelete(evento.id)}
                              className="text-red-400 hover:bg-zinc-700 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-white text-lg pr-8">{evento.titulo}</CardTitle>
                      <CardDescription className="text-zinc-400 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {date} às {time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-zinc-300">
                          {descricaoCurta ? `${evento.descricao.substring(0, 100)}...` : evento.descricao}
                        </p>
                        {descricaoCurta && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => openDescricaoDialog(evento.descricao)}
                            className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver mais
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center pt-2">
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                          {categorias.find((c) => c.value === evento.categoria)?.label}
                        </span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Concluído</span>
                        {evento.publico && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Público</span>
                        )}
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                          {evento.voluntarios_inscritos || 0} voluntário(s)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
