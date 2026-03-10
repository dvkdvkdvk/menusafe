'use client'

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function LandingCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-[#c8f547] px-4 py-24 sm:px-6">
      <div ref={contentRef} className="mx-auto max-w-3xl text-center opacity-0">
        <span className="mb-4 inline-block rounded-full bg-[#1a1a1a] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
          Get Started
        </span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#1a1a1a] sm:text-4xl md:text-5xl">
          Ready to dine with confidence?
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-[#1a1a1a]/80">
          Join thousands who trust MenuSafe. Start scanning menus for free.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button 
            size="lg" 
            className="group h-14 w-full rounded-full bg-[#1a1a1a] px-12 text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-[#2a2a2a] hover:shadow-xl sm:w-auto" 
            asChild
          >
            <Link href="/auth/sign-up">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            className="h-14 w-full rounded-full border-2 border-[#1a1a1a]/40 bg-transparent px-12 text-base font-bold uppercase tracking-wide text-[#1a1a1a] transition-all duration-300 hover:scale-105 hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white sm:w-auto" 
            asChild
          >
            <Link href="/pricing">See Pricing</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-[#1a1a1a]/70">
          3 free scans per month. No credit card required.
        </p>
      </div>
    </section>
  )
}
