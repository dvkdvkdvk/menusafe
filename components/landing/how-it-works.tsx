'use client'

import { useEffect, useRef } from "react"
import { Camera, Cpu, CheckCircle } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const steps = [
  {
    icon: Camera,
    number: "1",
    title: "Photograph",
    description: "Snap a photo of any menu with your phone camera.",
  },
  {
    icon: Cpu,
    number: "2",
    title: "Analyze",
    description: "Our AI reads every dish and checks your dietary needs.",
  },
  {
    icon: CheckCircle,
    number: "3",
    title: "Enjoy",
    description: "See what's safe and order with confidence.",
  },
]

export function LandingHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      const stepElements = stepsRef.current?.children
      if (stepElements) {
        gsap.fromTo(stepElements,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top 80%",
            }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="bg-background px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div ref={headingRef} className="text-center opacity-0">
          <span className="mb-4 inline-block rounded-full bg-[#c8f547] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1a1a1a]">
            How it works
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Three simple steps
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            From menu to meal confidence in three simple steps.
          </p>
        </div>

        <div ref={stepsRef} className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center opacity-0 transition-transform duration-300 hover:scale-105">
              {/* Number circle */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
                <span className="text-2xl font-bold">{step.number}</span>
              </div>
              
              <h3 className="text-lg font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
