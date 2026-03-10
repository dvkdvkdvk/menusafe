export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  priceInCents: number
  currency: string
  features: string[]
  scansPerMonth: number | null // null = unlimited
  recommended?: boolean
  // Platform-specific product IDs
  lemonSqueezyVariantId?: string // For web purchases (Lemon Squeezy)
  appleProductId?: string // For iOS App Store
  googleProductId?: string // For Google Play Store
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out MenuSafe',
    priceInCents: 0,
    currency: 'EUR',
    features: [
      '3 menu scans per month',
      'Basic dietary analysis',
      'Scan history (30 days)',
    ],
    scansPerMonth: 3,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For food allergy sufferers who dine out',
    priceInCents: 290,
    currency: 'EUR',
    features: [
      'Unlimited menu scans',
      'Advanced dietary analysis',
      'Unlimited scan history',
      'Priority support',
      'Export scan history',
    ],
    scansPerMonth: null,
    recommended: true,
    // Set these after creating products on each platform
    lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID || '',
    appleProductId: 'menusafe_pro_monthly',
    googleProductId: 'menusafe_pro_monthly',
  },
]

export function getPlanById(id: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id)
}

// Detect if running in native app context
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  // Check for Capacitor
  return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

// Get the platform (ios, android, or web)
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web'
  const capacitor = (window as { Capacitor?: { getPlatform?: () => string } }).Capacitor
  if (capacitor?.getPlatform) {
    const platform = capacitor.getPlatform()
    if (platform === 'ios') return 'ios'
    if (platform === 'android') return 'android'
  }
  return 'web'
}
