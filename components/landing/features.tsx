'use client'

import { useEffect, useRef } from "react"
import { ScanLine, ShieldCheck, History, Settings, Zap, Globe } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const features = [
  {
    icon: ScanLine,
    title: "Intelligent scanning",
    description: "Our AI reads menus from photos - even handwritten specials and multi-language menus.",
  },
  {
    icon: ShieldCheck,
    title: "Safety analysis",
    description: "Every dish classified as Safe, Caution, or Avoid based on your specific needs.",
  },
  {
    icon: Zap,
    title: "Instant results",
    description: "Get comprehensive analysis in seconds. No waiting, no guessing.",
  },
  {
    icon: History,
    title: "Scan history",
    description: "Keep a log of every restaurant menu you scan. Revisit past results anytime.",
  },
  {
    icon: Settings,
    title: "Your profile",
    description: "Set your dietary restrictions once and we remember them for every scan.",
  },
  {
    icon: Globe,
    title: "Global cuisines",
    description: "From fine dining to street food. Our AI understands cuisines worldwide.",
  },
]

export function LandingFeatures() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading on scroll
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
          }
        }
      )

      // Animate cards with stagger
      const cards = cardsRef.current?.children
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
            }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="features" className="bg-secondary px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div ref={headingRef} className="text-center opacity-0">
          <span className="mb-4 inline-block rounded-full bg-[#c8f547] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1a1a1a]">
            Features
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Built for your peace of mind
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Everything you need to navigate restaurant menus with confidence.
          </p>
        </div>

        <div ref={cardsRef} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="group rounded-3xl border-2 border-border bg-background p-6 opacity-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
