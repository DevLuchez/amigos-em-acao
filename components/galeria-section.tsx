"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react"
import { getStatusEvento, formatEventoDateTime } from "@/lib/utils/evento-utils"
import { getCategoriaLabel, CATEGORIAS_EVENTOS } from "@/lib/utils/categorias-eventos"
import { Button } from "@/components/ui/button"

type Foto = {
  id: string
  url: string
}

type EventoComFotos = {
  id: string
  titulo: string
  categoria: string
  data: string
  fotos: Foto[]
}

export default function GaleriaSection() {
  const [eventos, setEventos] = useState<EventoComFotos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todas")
  const [mostrarTodos, setMostrarTodos] = useState(false)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxFotos, setLightboxFotos] = useState<Foto[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxTitulo, setLightboxTitulo] = useState("")

  useEffect(() => {
    loadFotos()
    setIsMounted(true)
  }, [])

  const loadFotos = async () => {
    const supabase = createClient()

    const { data: eventosData } = await supabase
      .from("eventos")
      .select("id, titulo, categoria, data")
      .eq("publico", true)
      .order("data", { ascending: false })

    if (!eventosData) {
      setIsLoading(false)
      return
    }

    const eventosRealizados = eventosData.filter(
      (e) => getStatusEvento(e.data) === "realizado"
    )

    const eventosComFotos: EventoComFotos[] = []

    for (const evento of eventosRealizados) {
      const { data: fotosEvento } = await supabase
        .from("evento_fotos")
        .select("id, url")
        .eq("evento_id", evento.id)
        .order("created_at", { ascending: true })

      if (fotosEvento && fotosEvento.length > 0) {
        eventosComFotos.push({
          id: evento.id,
          titulo: evento.titulo,
          categoria: evento.categoria,
          data: evento.data,
          fotos: fotosEvento,
        })
      }
    }

    setEventos(eventosComFotos)
    setIsLoading(false)
  }

  const openLightbox = (evento: EventoComFotos) => {
    setLightboxFotos(evento.fotos)
    setLightboxIndex(0)
    setLightboxTitulo(evento.titulo)
    setLightboxOpen(true)
  }

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const prevPhoto = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === 0 ? lightboxFotos.length - 1 : prev - 1
    )
  }, [lightboxFotos.length])

  const nextPhoto = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === lightboxFotos.length - 1 ? 0 : prev + 1
    )
  }, [lightboxFotos.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prevPhoto()
      if (e.key === "ArrowRight") nextPhoto()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen, closeLightbox, prevPhoto, nextPhoto])

  if (isLoading || eventos.length === 0) return null

  // Categorias presentes nos dados, na ordem definida em CATEGORIAS_EVENTOS
  const categoriasPresentes = CATEGORIAS_EVENTOS
    .map((c) => c.value)
    .filter((v) => eventos.some((e) => e.categoria === v))

  // Filtra por categoria ativa
  const eventosFiltrados =
    categoriaAtiva === "todas"
      ? eventos
      : eventos.filter((e) => e.categoria === categoriaAtiva)

  // Mostra 3 ou todos
  const eventosParaMostrar = mostrarTodos
    ? eventosFiltrados
    : eventosFiltrados.slice(0, 3)

  const handleCategoriaChange = (cat: string) => {
    setCategoriaAtiva(cat)
    setMostrarTodos(false)
  }

  return (
    <>
      <section id="galeria" className="relative py-20 bg-gray-50">
        <div className="container mx-auto px-6 relative z-10">
          {/* Título */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-wider text-gray-900 mb-6">
              NOSSA{" "}
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                GALERIA
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Momentos que marcam nossa trajetória de solidariedade e transformação social.
            </p>
          </motion.div>

          {/* Abas de categoria — scroll horizontal em mobile */}
          <div className="overflow-x-auto -mx-6 px-6 pb-2 mb-10">
            <div className="flex gap-3 w-max mx-auto">
              <Button
                onClick={() => handleCategoriaChange("todas")}
                variant={categoriaAtiva === "todas" ? "default" : "outline"}
                className="font-bold px-5 py-4 text-sm sm:px-8 sm:py-6 sm:text-lg whitespace-nowrap"
              >
                Todas
              </Button>
              {categoriasPresentes.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => handleCategoriaChange(cat)}
                  variant={categoriaAtiva === cat ? "default" : "outline"}
                  className="font-bold px-5 py-4 text-sm sm:px-8 sm:py-6 sm:text-lg whitespace-nowrap"
                >
                  {getCategoriaLabel(cat)}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de cards */}
          {eventosFiltrados.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                {eventosParaMostrar.map((evento, index) => {
                  const capaUrl = evento.fotos[0].url
                  const { date } = formatEventoDateTime(evento.data)
                  return (
                    <motion.div
                      key={evento.id}
                      initial={isMounted ? { opacity: 0, y: 20 } : false}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                      onClick={() => openLightbox(evento)}
                      className="cursor-pointer group relative border-2 border-gray-200 hover:border-gray-900 transition-colors overflow-hidden aspect-square"
                      style={{
                        clipPath:
                          "polygon(30px 0%, calc(100% - 30px) 0%, 100% 30px, 100% 100%, calc(100% - 30px) 100%, 30px 100%, 0 100%, 0 0)",
                        boxShadow: "4px 4px 0px hsl(var(--border))",
                      }}
                    >
                      {/* Foto de capa */}
                      <img
                        src={capaUrl}
                        alt={evento.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Badge de contagem (visível sem hover) */}
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 group-hover:opacity-0 transition-opacity duration-300">
                        <Camera className="w-3 h-3" />
                        {evento.fotos.length}
                      </div>

                      {/* Overlay no hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100">
                        <span className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1.5">
                          {getCategoriaLabel(evento.categoria)}
                        </span>
                        <h3 className="text-white font-black text-lg tracking-wide leading-tight mb-2">
                          {evento.titulo}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-white/70">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{date}</span>
                          <span className="mx-1">·</span>
                          <span>
                            {evento.fotos.length} foto
                            {evento.fotos.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Toggle Ver todos / Ver menos */}
              {eventosFiltrados.length > 3 && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setMostrarTodos(!mostrarTodos)}
                    variant="outline"
                    className="font-bold px-8 py-6 text-base gap-2"
                  >
                    <LayoutGrid className="w-5 h-5" />
                    {mostrarTodos
                      ? "Ver menos"
                      : `Ver todos (${eventosFiltrados.length})`}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">
                Nenhum evento com fotos nessa categoria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && lightboxFotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors p-2"
              aria-label="Fechar galeria"
            >
              <X className="w-8 h-8" />
            </button>

            {lightboxFotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevPhoto()
                }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxFotos[lightboxIndex].url}
                alt={`Foto de ${lightboxTitulo}`}
                className="max-w-full max-h-[78vh] object-contain rounded-lg"
              />
              <div className="text-center mt-4">
                <p className="text-white font-bold text-lg">{lightboxTitulo}</p>
                <p className="text-white/50 text-sm mt-1">
                  {lightboxIndex + 1} / {lightboxFotos.length}
                </p>
              </div>
            </motion.div>

            {lightboxFotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextPhoto()
                }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
