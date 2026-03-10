'use client'

import { useState, useEffect } from 'react'
import { Check, Sparkles, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SUBSCRIPTION_PLANS, isNativeApp, getPlatform } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan?: string
  scansRemaining?: number
}

export function UpgradeModal({ open, onOpenChange, scansRemaining }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    setPlatform(getPlatform())
    async function getUserInfo() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      setUserEmail(user?.email || null)
    }
    getUserInfo()
  }, [])

  const handleUpgrade = async () => {
    setIsLoading(true)
    
    // Native apps: use in-app purchase
    if (isNativeApp()) {
      alert('In-app purchase will open. Complete the purchase to activate Pro.')
      setIsLoading(false)
      return
    }
    
    // Web: Use Lemon Squeezy checkout
    const checkoutUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL
    
    if (!checkoutUrl) {
      alert('Checkout is not configured yet. Please try again later.')
      setIsLoading(false)
      return
    }
    
    // Build URL with prefilled email and custom data
    const url = new URL(checkoutUrl)
    if (userEmail) {
      url.searchParams.set('checkout[email]', userEmail)
    }
    if (userId) {
      url.searchParams.set('checkout[custom][user_id]', userId)
    }
    url.searchParams.set('checkout[custom][success_url]', `${window.location.origin}/dashboard?session=success`)
    
    window.location.href = url.toString()
  }

  const proPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'pro')!

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            {scansRemaining !== undefined && scansRemaining <= 0
              ? "You've used all your free scans this month."
              : 'Unlock unlimited scans and premium features.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 rounded-lg bg-primary/10 p-4 text-center">
            <span className="text-3xl font-bold">€2.90</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-3">
            {proPlan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUpgrade} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {platform === 'web' ? 'Redirecting...' : 'Opening purchase...'}
              </>
            ) : (
              <>
                {platform === 'web' ? 'Subscribe now' : 'Subscribe'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          {platform === 'web' 
            ? 'Secure payment via Lemon Squeezy. Cancel anytime.' 
            : 'Managed by Apple/Google. Cancel in account settings.'}
        </p>
      </DialogContent>
    </Dialog>
  )
}
