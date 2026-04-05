"use client"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const slides = [
    {
      image: "/images/voluntarios-grupo-doacoes.png",
      alt: "Grupo de voluntários em ação",
    },
    {
      image: "https://www.shutterstock.com/image-photo/family-hands-holding-red-heart-600nw-1487364161.jpg",
      alt: "Mãos solidárias",
    },
    {
      image: "https://img.freepik.com/free-photo/hands-holding-each-other-support_23-2150446005.jpg?semt=ais_incoming&w=740&q=80",
      alt: "Mãos ajudando",
    },
  ]

  const navItems = [
    { name: "Início", href: "#hero" },
    { name: "Jornada", href: "#jornada" },
    { name: "Eventos", href: "#eventos" },
    { name: "Depoimentos", href: "#depoimentos" },
    { name: "Parceiros", href: "#parceiros" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [slides.length])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <div id="hero" className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('${slides[currentSlide].image}')`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-3 bg-black/35 backdrop-blur-md border-b border-white/10">
        {/* Logo/Brand */}
        <div className="text-white font-bold text-xl tracking-wider">AMIGOS EM AÇÃO</div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className="relative text-white hover:text-white transition-colors duration-300 font-medium tracking-wide pb-1 group"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
            </button>
          ))}
          <Link
            href="/auth/cadastro"
            className="border-2 border-white text-white px-6 py-2 rounded-full font-semibold tracking-wide hover:bg-white hover:text-black transition-all duration-300"
          >
            Cadastre-se
          </Link>
          <Link
            href="/auth/login"
            className="border-2 border-white text-white px-6 py-2 rounded-full font-semibold tracking-wide hover:bg-white hover:text-black transition-all duration-300"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white hover:text-gray-300 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/90 z-40 md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-white text-2xl font-bold tracking-wider hover:text-gray-300 transition-colors duration-300"
              >
                {item.name}
              </button>
            ))}
            <Link
              href="/auth/cadastro"
              onClick={() => setIsMenuOpen(false)}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-xl tracking-wide hover:bg-white hover:text-black transition-all duration-300"
            >
              Cadastre-se
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setIsMenuOpen(false)}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-xl tracking-wide hover:bg-white hover:text-black transition-all duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-6 pt-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-6xl w-full">
          {/* Logo da Associação */}
          <div className="shrink-0 drop-shadow-2xl transition-transform duration-700 hover:scale-105">
            <img
              src="/images/amigos-em-acao-logo.png"
              alt="Logo Amigos em Ação"
              className="w-56 sm:w-64 md:w-80 lg:w-96 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]"
            />
          </div>

          <div className="flex flex-col items-center text-center text-white max-w-3xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider mb-4 leading-none drop-shadow-lg">
              AMIGOS
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                EM AÇÃO
              </span>
            </h1>

            <p className="text-xl md:text-2xl font-light tracking-wide mb-8 text-gray-200 drop-shadow-md">
              <span className="font-bold">Sua doação</span> em movimento, <span className="font-bold">Nossa ação</span> em transformação
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
              <Link
                href="/auth/cadastro"
                className="border-2 border-white bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold text-lg tracking-wide hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
              >
                Quero ajudar
              </Link>
              <Link
                href="/beneficiado/cadastro"
                className="border-2 border-transparent bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold text-lg tracking-wide hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
              >
                Procuro ajuda
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-300 ${currentSlide === index
                  ? "w-3 h-3 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60 hover:w-2.5 hover:h-2.5"
                }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
