"use client"

import { motion } from "framer-motion"
import { Calendar, Users, Heart, ChevronRight, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
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
import { useRouter } from "next/navigation"

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

export default function EventosSection() {
  const [eventosRealizados, setEventosRealizados] = useState<Evento[]>([])
  const [eventosAgendados, setEventosAgendados] = useState<Evento[]>([])
  const [abaAtiva, setAbaAtiva] = useState<"realizados" | "futuros">("futuros")
  const [isLoading, setIsLoading] = useState(true)
  const [eventoLotado, setEventoLotado] = useState<Evento | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadEventos()
    setIsMounted(true)
  }, [])

  const loadEventos = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("eventos").select("*").eq("publico", true).order("data", { ascending: false })

    if (data) {
      const realizados = data.filter((e) => getStatusEvento(e.data) === "realizado")
      const agendados = data.filter((e) => getStatusEvento(e.data) === "proximo")
      setEventosRealizados(realizados.slice(0, 3))
      setEventosAgendados(agendados.slice(0, 3))
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

  const categoriaLabels: Record<string, string> = {
    doacoes_variadas: "Doações Variadas",
    comida: "Comida",
    vestimenta: "Vestimenta",
    financeira: "Financeira",
  }

  const truncateDescricao = (descricao: string, maxLength = 100) => {
    if (descricao.length <= maxLength) return descricao
    return descricao.substring(0, maxLength) + "..."
  }

  if (isLoading) {
    return (
      <section id="eventos" className="relative py-20 bg-white">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-600">Carregando eventos...</p>
        </div>
      </section>
    )
  }

  const eventosParaMostrar = abaAtiva === "realizados" ? eventosRealizados : eventosAgendados

  return (
    <section id="eventos" className="relative py-20 bg-white">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-wider text-gray-900 mb-6">
            NOSSOS{" "}
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">EVENTOS</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Todos os anos diminuimos a desigualdade nos arredores de Jaraguá do Sul, convertendo doações em fins sociais
            que transformam vidas.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-12">
          <Button
            onClick={() => setAbaAtiva("futuros")}
            variant={abaAtiva === "futuros" ? "default" : "outline"}
            className="font-bold px-8 py-6 text-lg"
          >
            Eventos Futuros
          </Button>
          <Button
            onClick={() => setAbaAtiva("realizados")}
            variant={abaAtiva === "realizados" ? "default" : "outline"}
            className="font-bold px-8 py-6 text-lg"
          >
            Eventos Realizados
          </Button>
        </div>

        {eventosParaMostrar.length > 0 ? (
          <div className="mb-12">
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {eventosParaMostrar.map((evento, index) => (
                  <motion.div
                    key={evento.id}
                    initial={isMounted ? { opacity: 0, x: 30 } : false}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className={`relative bg-white border-2 ${
                      abaAtiva === "realizados"
                        ? "border-gray-200 hover:border-gray-900"
                        : "border-blue-200 hover:border-blue-500"
                    } transition-colors p-8 flex flex-col`}
                    style={{
                      clipPath:
                        "polygon(30px 0%, calc(100% - 30px) 0%, 100% 30px, 100% 100%, calc(100% - 30px) 100%, 30px 100%, 0 100%, 0 0)",
                      boxShadow:
                        abaAtiva === "realizados"
                          ? "4px 4px 0px hsl(var(--border))"
                          : "4px 4px 0px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    {index === 2 && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "linear-gradient(to right, transparent 0%, white 100%)",
                          zIndex: 1,
                        }}
                      />
                    )}

                    <div className="flex items-center mb-6">
                      <div
                        className={`${abaAtiva === "realizados" ? "bg-gray-900" : "bg-blue-600"} text-white p-3 mr-4`}
                      >
                        {abaAtiva === "realizados" ? <Heart className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                      </div>
                      <h3 className="text-xl font-black text-gray-900 tracking-wider">{evento.titulo}</h3>
                    </div>

                    <div className="text-gray-600 leading-relaxed mb-6 flex-grow">
                      {evento.descricao.length > 100 ? (
                        <Dialog>
                          {truncateDescricao(evento.descricao)}
                          <DialogTrigger asChild>
                            <button className="text-left hover:text-gray-900 transition-colors">
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
                          abaAtiva === "realizados" ? "text-gray-500" : "text-blue-600 font-semibold"
                        } mb-4`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {formatEventoDateTime(evento.data).date} às {formatEventoDateTime(evento.data).time}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <div
                          className={`text-xs ${
                            abaAtiva === "realizados" ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-700"
                          } px-3 py-1 rounded inline-block mb-4`}
                        >
                          {categoriaLabels[evento.categoria] || evento.categoria}
                        </div>
                      </div>
                      {abaAtiva === "futuros" && (
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

              <Link
                href={`/eventos?tipo=${abaAtiva === "realizados" ? "realizados" : "futuros"}`}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`${
                    abaAtiva === "realizados" ? "bg-gray-900" : "bg-blue-600"
                  } text-white p-4 rounded-full shadow-lg group-hover:shadow-xl transition-all`}
                >
                  <ChevronRight className="w-8 h-8" />
                </motion.div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              {abaAtiva === "realizados" ? "Nenhum evento realizado ainda" : "Nenhum evento agendado no momento"}
            </p>
          </div>
        )}

        {eventosRealizados.length === 0 && eventosAgendados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Em breve teremos novos eventos! Fique atento.</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!eventoLotado} onOpenChange={() => setEventoLotado(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Que pena... Te vejo no próximo evento?
            </AlertDialogTitle>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                O evento <span className="font-semibold">{eventoLotado?.titulo}</span> já atingiu o número máximo de
                voluntários. Gostaria de se cadastrar no sistema para participar de eventos futuros?
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, obrigado</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/auth/cadastro")}>Sim, quero me cadastrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
