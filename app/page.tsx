"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import HeroSection from "@/components/hero-section"
import JornadaSection from "@/components/jornada-section"
import NossosPropositos from "@/components/nossos-propositos-section"
import EventosSection from "@/components/eventos-section"
import GaleriaSection from "@/components/galeria-section"
import DepoimentosSection from "@/components/depoimentos-section"
import ParceirosSection from "@/components/parceiros-section"
import FeedbackSection from "@/components/feedback-section"
import SmoothScrollHero from "@/components/ui/smooth-scroll-hero"

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    if (code) {
      router.replace(`/auth/callback?code=${code}&next=/auth/nova-senha`)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      <JornadaSection />

      <NossosPropositos />

      <EventosSection />

      <GaleriaSection />

      <DepoimentosSection />

      <ParceirosSection />

      <FeedbackSection />

      {/* Smooth Scroll Hero with CTA Overlay */}
      <section id="join" className="relative">
        <SmoothScrollHero
          scrollHeight={2500}
          desktopImage="https://www.bundaberg.qld.gov.au/files/assets/public/v/2/community/images/diverse_community_group_holding_hands_web.jpg?w=1600&h=600"
          mobileImage="https://www.bundaberg.qld.gov.au/files/assets/public/v/2/community/images/diverse_community_group_holding_hands_web.jpg?w=1600&h=600"
          initialClipPercentage={30}
          finalClipPercentage={70}
        />
      </section>
    </div>
  )
}
