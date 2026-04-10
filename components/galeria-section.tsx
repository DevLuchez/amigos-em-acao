"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { getStatusEvento, formatEventoDateTime } from "@/lib/utils/evento-utils"

type Foto = {
  id: string
  url: string
}

type EventoComFotos = {
  id: string
  titulo: string
  data: string
  fotos: Foto[]
}

export default function GaleriaSection() {
  const [eventos, setEventos] = useState<EventoComFotos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

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
      .select("id, titulo, data")
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
      if (eventosComFotos.length >= 3) break

      const { data: fotosEvento } = await supabase
        .from("evento_fotos")
        .select("id, url")
        .eq("evento_id", evento.id)
        .order("created_at", { ascending: true })

      if (fotosEvento && fotosEvento.length > 0) {
        eventosComFotos.push({
          id: evento.id,
          titulo: evento.titulo,
          data: evento.data,
          fotos: fotosEvento,
        })
      }
    }

    setEventos(eventosComFotos)
    setIsLoading(false)
  }

  const openLightbox = (evento: EventoComFotos, fotoIndex: number) => {
    setLightboxFotos(evento.fotos)
    setLightboxIndex(fotoIndex)
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

  return (
    <>
      <section id="galeria" className="relative py-20 bg-gray-50">
        <div className="container mx-auto px-6 relative z-10">
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
              Momentos que marcam nossa trajetória de solidariedade e
              transformação social.
            </p>
          </motion.div>

          <div className="space-y-12">
            {eventos.map((evento, eventoIndex) => {
              const { date, time } = formatEventoDateTime(evento.data)
              return (
                <motion.div
                  key={evento.id}
                  initial={isMounted ? { opacity: 0, y: 30 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: eventoIndex * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  viewport={{ once: true }}
                  className="bg-white border-2 border-gray-200 hover:border-gray-900 transition-colors overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(30px 0%, calc(100% - 30px) 0%, 100% 30px, 100% 100%, calc(100% - 30px) 100%, 30px 100%, 0 100%, 0 0)",
                    boxShadow: "4px 4px 0px hsl(var(--border))",
                  }}
                >
                  {/* Header do evento */}
                  <div className="p-6 md:p-8 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-900 text-white p-3">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-wider">
                          {evento.titulo}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{date} às {time}</span>
                          <span className="mx-2">•</span>
                          <span>{evento.fotos.length} foto{evento.fotos.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid de fotos */}
                  <div className="p-4 md:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {evento.fotos.map((foto, fotoIndex) => (
                        <motion.div
                          key={foto.id}
                          whileHover={{ scale: 1.03 }}
                          onClick={() => openLightbox(evento, fotoIndex)}
                          className="relative cursor-pointer overflow-hidden rounded-lg group aspect-square"
                        >
                          <img
                            src={foto.url}
                            alt={`Foto de ${evento.titulo}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
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
                <p className="text-white font-bold text-lg">
                  {lightboxTitulo}
                </p>
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
