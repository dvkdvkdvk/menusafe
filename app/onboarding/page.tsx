'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, CheckCircle, Heart, Share2, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: 'Scan Menus Instantly',
    description: 'Take a photo of any menu and instantly discover safe dishes for your dietary needs',
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: 'Save Favorites',
    description: 'Bookmark your safe menu items to quickly find them at restaurants you love',
  },
  {
    icon: <Share2 className="h-8 w-8" />,
    title: 'Share Results',
    description: 'Share scan results with friends and family via a secure link',
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Track Analytics',
    description: 'Monitor your dining patterns and see which restaurants are safest for you',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [completed, setCompleted] = useState(false)

  const handleGetStarted = async () => {
    setCompleted(true)
    // Mark onboarding as completed in the database
    try {
      const response = await fetch('/api/onboarding/complete', { method: 'POST' })
      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Header */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Welcome to MenuSafe
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AI-powered menu scanning for your dietary restrictions
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature, idx) => (
            <Card key={idx} className="rounded-2xl border-border/50">
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <div className="text-primary">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="rounded-3xl bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Ready to dine safely?</h2>
              <p className="mt-2 text-muted-foreground">
                Start by scanning your first menu and discover safe dishes for your dietary needs
              </p>
            </div>
            <Button
              onClick={handleGetStarted}
              disabled={completed}
              className="group h-12 gap-2 rounded-full px-8 text-base"
            >
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why MenuSafe?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-muted-foreground">Instant menu analysis with AI technology</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-muted-foreground">Support for 25+ dietary restrictions</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-muted-foreground">Offline mode for restaurants without WiFi</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-muted-foreground">Track your dining analytics over time</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-muted-foreground">Share results with dining companions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
