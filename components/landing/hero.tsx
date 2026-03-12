'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck } from "lucide-react"
import gsap from "gsap"

// Beautiful food images from Unsplash
const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80",
    alt: "Beautifully plated gourmet food"
  },
  {
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80",
    alt: "Delicious grilled meat dish"
  },
  {
    src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&q=80",
    alt: "Colorful fresh salad bowl"
  },
  {
    src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80",
    alt: "Fresh pizza with toppings"
  },
  {
    src: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&q=80",
    alt: "Elegant breakfast spread"
  },
]

export function LandingHero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)

  // Image slider interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // GSAP animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      
      tl.fromTo(badgeRef.current, 
        { opacity: 0, y: 30, scale: 0.9 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
      .fromTo(headlineRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.3"
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.3"
      )
      .fromTo(trustRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.2"
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={image.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              loading="eager"
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      {/* Decorative accent */}
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-[90vh] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        {/* Badge */}
        <div ref={badgeRef} className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#c8f547] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-[#1a1a1a] opacity-0">
          <ShieldCheck className="h-4 w-4" />
          <span>Dine safely</span>
        </div>

        {/* Main headline - Bold Graza style */}
        <h1 ref={headlineRef} className="font-serif text-4xl font-bold tracking-tight text-white opacity-0 sm:text-5xl md:text-6xl lg:text-7xl">
          Dine with confidence,
          <br />
          <span className="text-[#c8f547]">not compromise</span>
        </h1>

        {/* Subtitle */}
        <p ref={subtitleRef} className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-white/80 opacity-0 sm:text-xl">
          Scan any menu and instantly know what{"'"}s safe for you. 
          AI-powered analysis for your dietary needs.
        </p>

        {/* CTA buttons - Graza bold pill style */}
        <div ref={ctaRef} className="mt-12 flex flex-col items-center justify-center gap-4 opacity-0 sm:flex-row">
          <Button 
            size="lg" 
            className="group h-14 w-full rounded-full bg-[#c8f547] px-12 text-base font-bold uppercase tracking-wide text-[#1a1a1a] transition-all duration-300 hover:scale-105 hover:bg-[#d4f76a] hover:shadow-[0_0_30px_rgba(200,245,71,0.4)] sm:w-auto" 
            asChild
          >
            <Link href="/auth/sign-up">
              Start Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            className="h-14 w-full rounded-full border-2 border-white/40 bg-white/10 px-12 text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white hover:text-[#1a1a1a] sm:w-auto" 
            asChild
          >
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div ref={trustRef} className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-white/70 opacity-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c8f547]" />
            <span>10,000+ menus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c8f547]" />
            <span>15+ allergens</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c8f547]" />
            <span>99% accuracy</span>
          </div>
        </div>

        {/* Image slider indicators */}
        <div className="mt-12 flex items-center justify-center gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "w-8 bg-[#c8f547]" 
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
