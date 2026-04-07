"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function JornadaSection() {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const milestones: any[] = []

  return (
    <section id="jornada" className="relative py-20 bg-white">
      {/* Subtle Grid Pattern Removed */}

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
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">JORNADA</span>
          </h2>
          <div className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed space-y-4">
            <p>
              Somos uma ONG com mais de 24 anos de história, juntando forças para uma causa única: tornar nossa sociedade cada vez melhor.
            </p>
            <p>
              Todos os anos lutamos para a diminuição da desigualdade em nossa microrregião, ajudando através da doação de cestas básicas, bem como de diversas outras maneiras.
            </p>
            <p>
              Todos os recursos obtidos através das doações são totalmente destinados às famílias atendidas pela ONG.
            </p>
          </div>
        </motion.div>

        <div className="mb-20">
          <div className="relative">

            <div className="flex justify-center items-center relative">
              <div className="flex space-x-32 md:space-x-48">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={isMounted ? { opacity: 0, y: 20 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center relative"
                    onMouseEnter={() => setHoveredMilestone(index)}
                    onMouseLeave={() => setHoveredMilestone(null)}
                  >
                    <div className="w-4 h-4 bg-gray-900 rounded-full border-4 border-white shadow-sm z-10 cursor-pointer hover:scale-110 transition-transform" />

                    <div className="mt-6 text-center">
                      <div className="text-2xl font-black text-gray-900 mb-2">{milestone.year}</div>
                      <div className="text-lg font-bold text-gray-900 mb-2 tracking-wide">{milestone.title}</div>
                      <div className="text-sm text-gray-600 max-w-xs leading-relaxed">{milestone.description}</div>
                    </div>

                    {hoveredMilestone === index && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-32 bg-white p-2 border-2 border-gray-900 z-20"
                        style={{ boxShadow: "4px 4px 0px hsl(var(--foreground))" }}
                      >
                        <img
                          src={milestone.image || "/placeholder.svg"}
                          alt={milestone.title}
                          className="w-48 h-32 object-cover"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
