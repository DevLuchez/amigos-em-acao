"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Heart, Users, ArrowLeft, Search, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getStatusEvento, formatEventoDateTime, getStatusViabilidade } from "@/lib/utils/evento-utils"
import Link from "next/link"
import { motion } from "framer-motion"
import { stringContains } from "@/lib/utils/string-utils"

type Evento = {
  id: string
  titulo: string
  descricao: string
  categoria: string
  data: string
  publico: boolean
  quantidade_minima_voluntarios: number
  quantidade_maxima_voluntarios: number | null
  quantidade_inscritos: number
}

function EventosContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tipo = searchParams.get("tipo") || "futuros"
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [eventoLotado, setEventoLotado] = useState<Evento | null>(null)

  useEffect(() => {
    loadEventos()
  }, [tipo])

  const loadEventos = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("eventos").select("*").eq("publico", true).order("data", { ascending: false })

    if (data) {
      const filtrados =
        tipo === "realizados"
          ? data.filter((e) => getStatusEvento(e.data) === "realizado")
          : data.filter((e) => getStatusEvento(e.data) === "proximo")
      setEventos(filtrados)
    }
    setIsLoading(false)
  }

  const handleParticipar = async (evento: Evento) => {
    const statusViabilidade = getStatusViabilidade(
      evento.quantidade_inscritos,
      evento.quantidade_minima_voluntarios,
      evento.quantidade_maxima_voluntarios,
    )

    if (statusViabilidade === "lotado") {
      setEventoLotado(evento)
      return
    }

    router.push("/auth/cadastro")
  }

  const filterEventos = () => {
    let filtered = eventos

    if (searchTerm.trim()) {
      filtered = filtered.filter((evento) => stringContains(evento.titulo, searchTerm))
    }

    return filtered
  }

  const eventosFiltrados = filterEventos()

  const categoriaLabels: Record<string, string> = {
    doacoes_variadas: "Doações Variadas",
    comida: "Comida",
    vestimenta: "Vestimenta",
    financeira: "Financeira",
  }

  const truncateDescricao = (descricao: string, maxLength = 150) => {
    if (descricao.length <= maxLength) return descricao
    return descricao.substring(0, maxLength) + "..."
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Carregando eventos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <Link href="/#eventos">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-5xl font-black tracking-wider text-gray-900 mb-4">
            {tipo === "realizados" ? "EVENTOS REALIZADOS" : "EVENTOS FUTUROS"}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {tipo === "realizados"
              ? "Confira todos os eventos que já realizamos"
              : "Veja todos os eventos que estão por vir"}
          </p>

          <div className="flex gap-4 mb-6">
            <Link href="/eventos?tipo=futuros">
              <Button variant={tipo === "futuros" ? "default" : "outline"} className="font-bold">
                Eventos Futuros
              </Button>
            </Link>
            <Link href="/eventos?tipo=realizados">
              <Button variant={tipo === "realizados" ? "default" : "outline"} className="font-bold">
                Eventos Realizados
              </Button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar eventos por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {eventosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              {searchTerm.trim()
                ? "Nenhum evento encontrado com esse título"
                : tipo === "realizados"
                  ? "Nenhum evento realizado ainda"
                  : "Nenhum evento agendado no momento"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventosFiltrados.map((evento, index) => (
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className={`bg-white border-2 ${
                  tipo === "realizados"
                    ? "border-gray-200 hover:border-gray-900"
                    : "border-blue-200 hover:border-blue-500"
                } transition-colors p-8 flex flex-col`}
                style={{
                  clipPath:
                    "polygon(30px 0%, calc(100% - 30px) 0%, 100% 30px, 100% 100%, calc(100% - 30px) 100%, 30px 100%, 0 100%, 0 0)",
                  boxShadow:
                    tipo === "realizados" ? "4px 4px 0px hsl(var(--border))" : "4px 4px 0px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="flex items-center mb-6">
                  <div className={`${tipo === "realizados" ? "bg-gray-900" : "bg-blue-600"} text-white p-3 mr-4`}>
                    {tipo === "realizados" ? <Heart className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 tracking-wider">{evento.titulo}</h3>
                </div>

                <div className="text-gray-600 leading-relaxed mb-6 flex-grow">
                  {evento.descricao.length > 100 ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-left hover:text-gray-900 transition-colors">
                          {truncateDescricao(evento.descricao)}
                          <span className="text-blue-600 ml-1 underline">Ver mais</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{evento.titulo}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-gray-600 leading-relaxed">{evento.descricao}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-medium">
                              {formatEventoDateTime(evento.data).date} às {formatEventoDateTime(evento.data).time}
                            </span>
                          </div>
                          <div className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded inline-block">
                            {categoriaLabels[evento.categoria] || evento.categoria}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <p>{evento.descricao}</p>
                  )}
                </div>

                <div className="mt-auto">
                  <div
                    className={`flex items-center text-sm ${
                      tipo === "realizados" ? "text-gray-500" : "text-blue-600 font-semibold"
                    } mb-4`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {formatEventoDateTime(evento.data).date} às {formatEventoDateTime(evento.data).time}
                    </span>
                  </div>
                  <div
                    className={`text-xs ${
                      tipo === "realizados" ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-700"
                    } px-3 py-1 rounded inline-block mb-4`}
                  >
                    {categoriaLabels[evento.categoria] || evento.categoria}
                  </div>
                  {tipo === "futuros" && (
                    <button
                      onClick={() => handleParticipar(evento)}
                      className="w-full bg-blue-600 text-white py-3 px-6 font-bold tracking-wider hover:bg-blue-700 transition-colors border-2 border-blue-600"
                    >
                      PARTICIPAR
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!eventoLotado} onOpenChange={() => setEventoLotado(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Evento Lotado
            </AlertDialogTitle>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="text-base font-semibold text-foreground">
                QTDE máxima já atingida. Te vejo no próximo evento!
              </p>
              <p>
                O evento <span className="font-semibold">{eventoLotado?.titulo}</span> já atingiu o número máximo de
                voluntários.
              </p>
              <p>Gostaria de se cadastrar no sistema para participar de eventos futuros?</p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, obrigado</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/auth/cadastro")}>Sim, quero me cadastrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function EventosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      }
    >
      <EventosContent />
    </Suspense>
  )
}
