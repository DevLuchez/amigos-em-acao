"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react"
import { getStatusEvento, formatEventoDateTime } from "@/lib/utils/evento-utils"

type FotoComEvento = {
  id: string
  url: string
  evento_titulo: string
  evento_data: string
}

export default function GaleriaSection() {
  const [fotos, setFotos] = useState<FotoComEvento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    loadFotos()
    setIsMounted(true)
  }, [])

  const loadFotos = async () => {
    const supabase = createClient()

    // Buscar eventos públicos realizados, ordenados por data mais recente
    const { data: eventos } = await supabase
      .from("eventos")
      .select("id, titulo, data")
      .eq("publico", true)
      .order("data", { ascending: false })

    if (!eventos) {
      setIsLoading(false)
      return
    }

    // Filtrar apenas eventos já realizados
    const eventosRealizados = eventos.filter(
      (e) => getStatusEvento(e.data) === "realizado"
    )

    // Buscar fotos dos 3 eventos realizados mais recentes que tenham fotos
    const todasFotos: FotoComEvento[] = []
    let eventosComFotos = 0

    for (const evento of eventosRealizados) {
      if (eventosComFotos >= 3) break

      const { data: fotosEvento } = await supabase
        .from("evento_fotos")
        .select("id, url")
        .eq("evento_id", evento.id)
        .order("created_at", { ascending: true })

      if (fotosEvento && fotosEvento.length > 0) {
        eventosComFotos++
        fotosEvento.forEach((foto) => {
          todasFotos.push({
            id: foto.id,
            url: foto.url,
            evento_titulo: evento.titulo,
            evento_data: evento.data,
          })
        })
      }
    }

    setFotos(todasFotos)
    setIsLoading(false)
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const prevPhoto = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev === 0 ? fotos.length - 1 : prev - 1) : null
    )
  }, [fotos.length])

  const nextPhoto = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev === fotos.length - 1 ? 0 : prev + 1) : null
    )
  }, [fotos.length])

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prevPhoto()
      if (e.key === "ArrowRight") nextPhoto()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto])

  // Não renderizar a seção se não houver fotos
  if (isLoading || fotos.length === 0) return null

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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {fotos.map((foto, index) => {
              const { date } = formatEventoDateTime(foto.evento_data)
              return (
                <motion.div
                  key={foto.id}
                  initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => openLightbox(index)}
                  className="relative cursor-pointer overflow-hidden rounded-xl group aspect-square"
                >
                  <img
                    src={foto.url}
                    alt={`Foto de ${foto.evento_titulo}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <p className="text-white text-sm md:text-base font-bold truncate">
                        {foto.evento_titulo}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Camera className="w-3 h-3 text-white/70" />
                        <span className="text-white/70 text-xs">{date}</span>
                      </div>
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
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Botão fechar */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors p-2"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Seta esquerda */}
            {fotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevPhoto()
                }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Foto */}
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
                src={fotos[lightboxIndex].url}
                alt={`Foto de ${fotos[lightboxIndex].evento_titulo}`}
                className="max-w-full max-h-[78vh] object-contain rounded-lg"
              />
              <div className="text-center mt-4">
                <p className="text-white font-bold text-lg">
                  {fotos[lightboxIndex].evento_titulo}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  {formatEventoDateTime(fotos[lightboxIndex].evento_data).date} •{" "}
                  {lightboxIndex + 1} / {fotos.length}
                </p>
              </div>
            </motion.div>

            {/* Seta direita */}
            {fotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextPhoto()
                }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10"
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
