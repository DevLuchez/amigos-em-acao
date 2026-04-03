"use client"

import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-600/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Mantendo apenas o espaçamento e estrutura básica da seção */}
          <div className="h-32"></div>
        </motion.div>
      </div>
    </section>
  )
}
