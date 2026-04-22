"use client"

import type * as React from "react"
import { Facebook, Instagram, MessageCircle, MapPin, Mail, Linkedin } from "lucide-react"

interface SmoothScrollHeroProps {
  desktopImage: string
  mobileImage: string
}

const SmoothScrollHero: React.FC<SmoothScrollHeroProps> = ({
  desktopImage,
  mobileImage,
}) => {
  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Desktop background */}
      <div className="absolute inset-0 hidden md:block">
        <img
          src={desktopImage || "/placeholder.svg"}
          alt="Voluntários Amigos em Ação"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Mobile background */}
      <div className="absolute inset-0 md:hidden">
        <img
          src={mobileImage || "/placeholder.svg"}
          alt="Voluntários Amigos em Ação"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-20 overflow-y-auto py-8">
        <div className="text-center text-white max-w-4xl mx-auto px-6 w-full">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-wider mb-4 md:mb-6 leading-none">
            PRONTO PARA
            <br />
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              FAZER A DIFERENÇA?
            </span>
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 md:mb-12 leading-relaxed font-medium">
            Junte-se a milhares de pessoas que já transformaram vidas,
            <br className="hidden md:block" />
            descobriram o poder da solidariedade e construíram um mundo melhor.
          </p>

          {/* --- INÍCIO DA ÁREA DE CONTATOS E REDES SOCIAIS --- */}
          <div className="flex flex-col items-center justify-center gap-4 md:gap-6 mb-4 md:mb-8">

            {/* Topo: Apenas Redes Sociais Clicáveis */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/associacaoamigosemacao/?locale=pt_BR"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Facebook da Associação"
              >
                <Facebook className="w-6 h-6 text-white" />
              </a>

              <a
                href="https://www.instagram.com/amigosemacaojgs/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram da Associação"
              >
                <Instagram className="w-6 h-6 text-white" />
              </a>

              <a
                href="https://www.linkedin.com/company/associa%C3%A7%C3%A3o-amigos-em-a%C3%A7%C3%A3o"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn da Associação"
              >
                <Linkedin className="w-6 h-6 text-white" />
              </a>
            </div>

            {/* Base: Informações de Contato Visíveis (Formato Pill/Badge) */}
            <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-3 md:gap-4 text-white w-full">

              {/* Telefone / WhatsApp */}
              <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md px-5 py-2.5 rounded-full border border-white/5">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm md:text-base font-medium tracking-wide">
                  (47) 99983-2944 <span className="opacity-40 mx-1">|</span> (47) 98822-1707
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md px-5 py-2.5 rounded-full border border-white/5">
                <Mail className="w-5 h-5 text-gray-300" />
                <span className="text-sm md:text-base font-medium tracking-wide">
                  amigosemacaojgs@gmail.com
                </span>
              </div>

              {/* Localização */}
              <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md px-5 py-2.5 rounded-full border border-white/5">
                <MapPin className="w-5 h-5 text-gray-300" />
                <span className="text-sm md:text-base font-medium tracking-wide">
                  Santa Catarina, Brasil
                </span>
              </div>

            </div>
          </div>
          {/* --- FIM DA ÁREA DE CONTATOS E REDES SOCIAIS --- */}

          <div className="mt-4 md:mt-12 pt-4 md:pt-6 border-t border-white/20">
            <p className="text-xs text-gray-300 mb-3 font-medium">
              © 2025 Amigos em Ação. Todos os direitos reservados.
              <span className="mx-2">|</span>
              <a href="#" className="hover:text-gray-50 transition-colors duration-300">
                Política de Privacidade
              </a>
              <span className="mx-2">|</span>
              <a href="#" className="hover:text-gray-50 transition-colors duration-300">
                Termos de Uso
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SmoothScrollHero
