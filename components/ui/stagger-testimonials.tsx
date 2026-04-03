"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// Ícone de estrela para as avaliações
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-5 h-5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const testimonials = [
  {
    name: "Ana Silva",
    text: "Participei do evento de distribuição de alimentos e foi uma experiência incrível. A organização Amigos em Ação realmente faz a diferença na comunidade!",
    rating: 5,
  },
  {
    name: "Carlos Mendes",
    text: "Sou voluntário há 6 meses e me sinto realizado em poder contribuir. O impacto do trabalho é visível e inspirador. Recomendo a todos!",
    rating: 4,
  },
  {
    name: "Maria Oliveira",
    text: "Recebi ajuda da Amigos em Ação em um momento difícil. A doação de roupas e alimentos fez toda a diferença para minha família. Gratidão eterna!",
    rating: 3,
  },
  {
    name: "João Pereira",
    text: "A iniciativa de arrecadação de brinquedos trouxe muita alegria para as crianças da minha comunidade. É lindo ver o sorriso delas!",
    rating: 5,
  },
]

export function StaggerTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000) // Muda a cada 5 segundos

    return () => clearInterval(interval)
  }, [testimonials.length])

  const handleMove = (direction: number) => {
    setCurrentTestimonial((prev) => {
      const newIndex = (prev + direction + testimonials.length) % testimonials.length
      return newIndex
    })
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 px-4">
      <div className="relative overflow-hidden">
        <motion.div
          key={currentTestimonial}
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-xl p-8 pt-12 text-center relative max-w-md mx-auto" // Aumentei o padding-top para o avatar
          style={{ minHeight: '320px' }} // Altura mínima para manter o card consistente
        >
          {/* Aspas */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-200 text-6xl font-serif select-none">
            &rdquo;
          </span>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">
            {testimonials[currentTestimonial].name}
          </h3>
          <p className="text-gray-600 mb-4 italic leading-relaxed">
            {testimonials[currentTestimonial].text}
          </p>
          <div className="flex justify-center items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < testimonials[currentTestimonial].rating} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 mt-4 z-10">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTestimonial(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentTestimonial === index ? "bg-black" : "bg-gray-400 hover:bg-gray-600"
            }`}
            aria-label={`Ver depoimento ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
