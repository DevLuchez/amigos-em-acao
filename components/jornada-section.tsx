"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getStatusEvento } from "@/lib/utils/evento-utils"

export default function JornadaSection() {
  const [isMounted, setIsMounted] = useState(false)
  const [eventosRealizados, setEventosRealizados] = useState(0)
  const [voluntarios, setVoluntarios] = useState(0)
  const [pessoasAjudadas, setPessoasAjudadas] = useState(0)

  useEffect(() => {
    const loadEventosRealizados = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("eventos").select("data")

      if (data) {
        const realizados = data.filter((e) => getStatusEvento(e.data) === "realizado")
        setEventosRealizados(realizados.length)
      }
    }

    const loadVoluntarios = async () => {
      const supabase = createClient()
      const { count } = await supabase.from("voluntarios").select("*", { count: "exact", head: true })

      if (count !== null) {
        setVoluntarios(count)
      }
    }

    const loadPessoasAjudadas = async () => {
      const supabase = createClient()
      const { count, error } = await supabase
        .from("solicitacoes_ajuda")
        .select("*", { count: "exact", head: true })
        .eq("status", "concluida")

      if (!error && count !== null) {
        setPessoasAjudadas(count)
      }
    }

    loadEventosRealizados()
    loadVoluntarios()
    loadPessoasAjudadas()
    setIsMounted(true)
  }, [])

  const statistics = [
    { number: "+100", label: "Voluntários" },
    { number: "+60", label: "Famílias Atendidas/mês" },
    { number: "+10", label: "Eventos Realizados/mês" },
    { number: "+24", label: "Anos de Experiência" },
  ]

  return (
    <section id="jornada" className="relative py-20 bg-white">
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
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

        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full"
        >
          {statistics.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-wider">{stat.number}</div>
              <div className="text-lg font-medium text-gray-600 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
