"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function NossosPropositos() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const values = [
    {
      title: "Missão",
      description:
        "Combater as desigualdades sociais por meio de ações concretas e sustentáveis; Fomentar o espírito de voluntariado e desenvolver programas nas áreas de cultura, esporte, educação e lazer que reforçam a cidadania e a inclusão social.",
    },
    {
      title: "Visão",
      description:
        "Ser uma força transformadora na sociedade, promovendo a igualdade e a inclusão social. Aspiramos a um mundo onde cada indivíduo tenha a oportunidade de contribuir e prosperar, independentemente de sua origem ou condição social.",
    },
    {
      title: "Valores",
      description:
        "Compromisso com a igualdade; Integridade e transparência; Respeito pela diversidade; Empatia e compaixão; Empoderamento; Colaboração e parceria; Inovação; Voluntariado ativo.",
    },
  ]

  return (
    <section id="propositos" className="relative py-20 bg-gray-50">
      {/* Subtle Grid Pattern */}

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
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">PROPÓSITOS</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Propósitos que inspiram ação, promovem solidariedade e geram impacto real.
          </p>
        </motion.div>

        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {values.map((value, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-8 border-2 border-gray-200 hover:border-gray-900 transition-colors text-center"
              style={{
                clipPath:
                  "polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, calc(100% - 20px) 100%, 20px 100%, 0 100%, 0 0)",
                boxShadow: "4px 4px 0px hsl(var(--border))",
              }}
            >
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-wider">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>


      </div>
    </section>
  )
}
