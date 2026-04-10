"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Star } from "lucide-react"

export default function FeedbackSection() {
  const [estrelas, setEstrelas] = useState(0)
  const [hoverEstrelas, setHoverEstrelas] = useState(0)
  const [mensagem, setMensagem] = useState("")
  const [charCount, setCharCount] = useState(0)
  const MAX_MENSAGEM_LENGTH = 500
  const [anonimo, setAnonimo] = useState(true)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (estrelas === 0) {
      setError("Por favor, selecione uma avaliação em estrelas.")
      return
    }

    if (!mensagem.trim()) {
      setError("Por favor, escreva uma mensagem.")
      return
    }

    if (!anonimo && (!nome.trim() || !email.trim())) {
      setError("Por favor, preencha seu nome e email.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const supabase = createClient()

      const feedbackData = {
        estrelas,
        mensagem: mensagem.trim(),
        anonimo,
        nome: anonimo ? null : nome.trim(),
        email: anonimo ? null : email.trim(),
      }

      const { error: insertError } = await supabase.from("feedbacks").insert(feedbackData)

      if (insertError) {
        setError("Erro ao enviar feedback. Tente novamente.")
        setIsSubmitting(false)
        return
      }

      setSubmitted(true)
      // Limpar formulário
      setEstrelas(0)
      setMensagem("")
      setCharCount(0)
      setNome("")
      setEmail("")
      setAnonimo(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch {
      setError("Erro ao enviar feedback. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="feedback" className="relative py-20 bg-white">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-wider text-gray-900 mb-6">
            COMPARTILHE SUA{" "}
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              EXPERIÊNCIA
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Seu feedback nos ajuda a melhorar nossos serviços e continuar transformando vidas.
          </p>
        </motion.div>

        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmitFeedback} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 tracking-wide">AVALIAÇÃO</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEstrelas(star)}
                    onMouseEnter={() => setHoverEstrelas(star)}
                    onMouseLeave={() => setHoverEstrelas(0)}
                    className="transition-transform hover:scale-110"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverEstrelas || estrelas) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-sm font-bold text-gray-900 mb-3 tracking-wide">
                SUA MENSAGEM
              </label>
              <textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_MENSAGEM_LENGTH) {
                    setMensagem(e.target.value)
                    setCharCount(e.target.value.length)
                  }
                }}
                placeholder="Conte-nos sobre sua experiência com a Amigos em Ação..."
                className="w-full p-4 border-2 border-gray-200 focus:border-gray-900 transition-colors resize-none rounded-none"
                rows={6}
                disabled={isSubmitting}
                maxLength={MAX_MENSAGEM_LENGTH}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {charCount} / {MAX_MENSAGEM_LENGTH} caracteres
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="anonimo"
                checked={anonimo}
                onChange={(e) => setAnonimo(e.target.checked)}
                className="h-5 w-5 border-2 border-gray-900"
                disabled={isSubmitting}
              />
              <label htmlFor="anonimo" className="text-sm font-bold text-gray-900 tracking-wide cursor-pointer">
                ENVIAR COMO ANÔNIMO
              </label>
            </div>

            {!anonimo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="nome" className="block text-sm font-bold text-gray-900 mb-2 tracking-wide">
                    SEU NOME
                  </label>
                  <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full p-4 border-2 border-gray-200 focus:border-gray-900 transition-colors rounded-none"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2 tracking-wide">
                    SEU EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="w-full p-4 border-2 border-gray-200 focus:border-gray-900 transition-colors rounded-none"
                    disabled={isSubmitting}
                  />
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white py-4 px-6 font-black tracking-wider hover:bg-gray-800 transition-colors border-2 border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "ENVIANDO..." : "ENVIAR FEEDBACK"}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 bg-red-50 border-2 border-red-500"
              >
                <p className="text-red-700 font-bold tracking-wide">{error}</p>
              </motion.div>
            )}

            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 bg-gray-100 border-2 border-gray-900"
              >
                <p className="text-gray-900 font-bold tracking-wide">
                  OBRIGADO PELO SEU FEEDBACK! SUA MENSAGEM FOI ENVIADA COM SUCESSO.
                </p>
              </motion.div>
            )}
          </form>

          {anonimo && (
            <div className="mt-6 text-center text-sm text-gray-600">
              <p className="font-medium">Seus dados são mantidos em total anonimato e confidencialidade.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
