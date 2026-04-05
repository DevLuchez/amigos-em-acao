"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function ParceirosSection() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  const parceiros = [
    {
      name: "WEG",
      logo: "/images/parceiros/weg-logo.png",
      url: "https://www.weg.net/",
    },
    {
      name: "Católica SC",
      logo: "/images/parceiros/catolicasc-logo.png",
      url: "https://www.catolicasc.org.br/",
    },
    {
      name: "Colégio Marista São Luís",
      logo: "/images/parceiros/marista-logo.png",
      url: "https://marista.edu.br/saoluis/",
    },
    {
      name: "Alfa Rede de Ensino",
      logo: "/images/parceiros/alfa-logo.png",
      url: "https://www.ensinoalfa.com.br/",
    },
    {
      name: "Sleep Way Pijamas e Cia",
      logo: "/images/parceiros/sleepway-logo.png",
      url: "https://www.instagram.com/sleepwaypijamas/",
    },
    {
      name: "Grupo Flexível",
      logo: "/images/parceiros/grupo-flexivel-logo.png",
      url: "https://www.grupoflexivel.com.br/",
    },
    {
      name: "Receituário Farmácia Magistral",
      logo: "/images/parceiros/receituario-logo.png",
      url: "https://www.receituario.com.br/",
    },
    {
      name: "Lili & Naty Pilates",
      logo: "/images/parceiros/pilates-logo.png",
      url: "https://www.instagram.com/lilienaty_pilates/",
    },
  ]

  return (
    <section id="parceiros" className="relative pt-20 pb-20 bg-white">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-wider text-gray-900 mb-6">
            PARCEIROS EM{" "}
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">AÇÃO</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Juntos, transformamos ainda mais vidas. Entre em ação e faça parte dessa mudança!
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {parceiros.map((parceiro, index) => (
            <a
              key={index}
              href={parceiro.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full h-32"
            >
              <motion.div
                className="flex items-center justify-center w-full h-full p-4 relative"
                initial={isMounted ? { opacity: 0, scale: 0.8 } : false}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                <Image
                  src={parceiro.logo || "/placeholder.svg"}
                  alt={`Logo ${parceiro.name}`}
                  width={200}
                  height={100}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    console.log("[v0] Erro ao carregar imagem:", parceiro.logo)
                    e.currentTarget.src = "/placeholder.svg?height=100&width=200"
                  }}
                />
              </motion.div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
