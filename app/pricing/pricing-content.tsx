'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SUBSCRIPTION_PLANS, isNativeApp, getPlatform } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'

export function PricingContent() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')
  const success = searchParams.get('success')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setUserId(user?.id || null)
      setUserEmail(user?.email || null)
    }
    checkAuth()
    setPlatform(getPlatform())
  }, [])

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/auth/sign-up'
      return
    }

    if (planId === 'pro') {
      setIsLoading(planId)
      
      // Native apps use in-app purchase
      if (isNativeApp()) {
        alert('In-app purchase will open. Complete the purchase to activate Pro.')
        setIsLoading(null)
        return
      }
      
      // Web: Use Lemon Squeezy checkout
      const checkoutUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL
      
      if (!checkoutUrl) {
        alert('Checkout is not configured yet. Please try again later.')
        setIsLoading(null)
        return
      }
      
      try {
        // Build URL with prefilled email and custom data
        const url = new URL(checkoutUrl)
        if (userEmail) {
          url.searchParams.set('checkout[email]', userEmail)
        }
        if (userId) {
          url.searchParams.set('checkout[custom][user_id]', userId)
        }
        // Success redirect URL
        url.searchParams.set('checkout[custom][success_url]', `${window.location.origin}/dashboard?session=success`)
        
        window.location.href = url.toString()
      } catch {
        // Fallback: just redirect to the base URL
        window.location.href = checkoutUrl
      }
    }
  }

  const freePlan = SUBSCRIPTION_PLANS.find(p => p.id === 'free')!
  const proPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'pro')!

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="transition-transform duration-200 hover:scale-105">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="rounded-full">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="rounded-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
          {canceled && (
            <div className="mb-8 rounded-xl border border-caution/30 bg-caution/10 p-4 text-center text-sm text-caution">
              Payment was canceled. Feel free to try again when you are ready.
            </div>
          )}
          
          {success && (
            <div className="mb-8 rounded-xl border border-primary/30 bg-primary/10 p-4 text-center text-sm text-primary">
              Thank you for subscribing! Your Pro features are now active.
            </div>
          )}

          <div className="mb-16 text-center">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Start free, upgrade when you need more scans. No hidden fees.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Free Plan */}
            <Card className="relative flex flex-col rounded-2xl border-border">
              <CardHeader className="pt-8">
                <CardTitle className="text-xl font-semibold">{freePlan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{freePlan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-semibold">€0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3">
                  {freePlan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-8">
                <Button
                  className="w-full rounded-full"
                  variant="outline"
                  size="lg"
                  onClick={() => handleSelectPlan('free')}
                >
                  Get started free
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="relative flex flex-col rounded-2xl border-primary/40 bg-primary/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                Recommended
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-xl font-semibold">{proPlan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{proPlan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-semibold">€2.90</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3">
                  {proPlan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-8">
                <Button
                  className="w-full rounded-full"
                  variant="default"
                  size="lg"
                  onClick={() => handleSelectPlan('pro')}
                  disabled={isLoading === 'pro'}
                >
                  {isLoading === 'pro' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {platform === 'web' ? 'Redirecting to checkout...' : 'Opening purchase...'}
                    </>
                  ) : (
                    <>
                      {platform === 'web' ? 'Subscribe now' : 'Subscribe'} <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-12 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Secure payment. Cancel anytime.
            </p>
            <p className="text-xs text-muted-foreground">
              {platform === 'web' 
                ? 'Payments processed securely by Lemon Squeezy. VAT included where applicable.'
                : 'Payments processed by Apple/Google. Manage subscription in your account settings.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
