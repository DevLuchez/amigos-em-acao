"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials"

export default function DepoimentosSection() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  return (
    <section id="depoimentos" className="relative py-20 bg-gray-50">
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
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">AMIGOS</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Mais de 100 Amigos entram em Ação para ajudar a construir um futuro melhor para Jaraguá do Sul, Guaramirim, Schroeder e Corupá. Entre você também em ação e nos ajude a mudar as histórias de vida de muitas famílias.

          </p>
        </motion.div>

        <StaggerTestimonials />
      </div>
    </section>
  )
}
