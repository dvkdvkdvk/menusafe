// Subscription tiers and limits
export type SubscriptionTier = 'free' | 'pro'

export interface SubscriptionLimits {
  scansPerMonth: number | 'unlimited'
  features: string[]
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    scansPerMonth: 3,
    features: [
      'Up to 3 menu scans per month',
      'Basic dietary analysis',
      'Save scan history',
    ],
  },
  pro: {
    scansPerMonth: 'unlimited',
    features: [
      'Unlimited menu scans',
      '25+ dietary restrictions',
      'Restaurant safety rankings',
      'Priority AI processing',
      'Export scan history',
    ],
  },
}

export const SUBSCRIPTION_PRICES = {
  pro: {
    monthly: 290, // in cents (€2.90)
    currency: 'EUR',
  },
}

export function canScan(tier: SubscriptionTier, monthlyCount: number): boolean {
  const limits = SUBSCRIPTION_LIMITS[tier]
  if (limits.scansPerMonth === 'unlimited') return true
  return monthlyCount < limits.scansPerMonth
}

export function getScansRemaining(tier: SubscriptionTier, monthlyCount: number): number | 'unlimited' {
  const limits = SUBSCRIPTION_LIMITS[tier]
  if (limits.scansPerMonth === 'unlimited') return 'unlimited'
  return Math.max(0, limits.scansPerMonth - monthlyCount)
}

export function formatScansRemaining(tier: SubscriptionTier, monthlyCount: number): string {
  const remaining = getScansRemaining(tier, monthlyCount)
  if (remaining === 'unlimited') return 'Unlimited scans'
  if (remaining === 0) return 'No scans remaining'
  return `${remaining} scan${remaining !== 1 ? 's' : ''} remaining`
}
