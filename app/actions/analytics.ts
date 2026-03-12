'use server'

import { createClient } from '@/lib/supabase/server'
import type { UserAnalytics, ScanAnalytics } from '@/lib/types'
import type { MenuItem } from '@/lib/types'

export async function trackScanAnalytics(scanId: string, menuItems: MenuItem[], restaurantName?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Calculate analytics for this scan
  const itemsAnalyzed = menuItems.length
  const safeItems = menuItems.filter(i => i.safety === 'safe').length
  const safePercentage = itemsAnalyzed > 0 ? Math.round((safeItems / itemsAnalyzed) * 100) : 0

  // Get current user analytics
  const { data: profile } = await supabase
    .from('profiles')
    .select('scan_analytics')
    .eq('id', user.id)
    .single()

  const scanAnalytics = (profile?.scan_analytics as ScanAnalytics[]) || []

  // Add new scan analytics
  const newAnalytic: ScanAnalytics = {
    id: scanId,
    user_id: user.id,
    scan_id: scanId,
    items_analyzed: itemsAnalyzed,
    safe_percentage: safePercentage,
    dietary_mode_used: 'strict', // This should come from the actual dietary mode used
    restaurant_name: restaurantName,
    timestamp: new Date().toISOString(),
  }

  scanAnalytics.push(newAnalytic)

  // Keep only last 100 scans in analytics
  const recentAnalytics = scanAnalytics.slice(-100)

  // Update profile with analytics
  await supabase
    .from('profiles')
    .update({ scan_analytics: recentAnalytics })
    .eq('id', user.id)

  return newAnalytic
}

export async function getUserAnalytics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all scans to calculate aggregate analytics
  const { data: scans } = await supabase
    .from('scans')
    .select('menu_items, restaurants(name)')
    .eq('user_id', user.id)

  if (!scans || scans.length === 0) {
    return {
      id: user.id,
      user_id: user.id,
      total_scans: 0,
      total_safe_items: 0,
      total_caution_items: 0,
      total_unsafe_items: 0,
      favorite_restaurants: [],
      most_frequent_safety_level: 'safe' as const,
      updated_at: new Date().toISOString(),
    }
  }

  let totalSafe = 0
  let totalCaution = 0
  let totalUnsafe = 0
  const restaurantMap: { [key: string]: number } = {}

  for (const scan of scans) {
    const items = (scan.menu_items || []) as MenuItem[]
    totalSafe += items.filter(i => i.safety === 'safe').length
    totalCaution += items.filter(i => i.safety === 'caution').length
    totalUnsafe += items.filter(i => i.safety === 'unsafe').length

    const restaurantName = (scan.restaurants as any)?.name
    if (restaurantName) {
      restaurantMap[restaurantName] = (restaurantMap[restaurantName] || 0) + 1
    }
  }

  // Get top restaurants
  const topRestaurants = Object.entries(restaurantMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name)

  const totalItems = totalSafe + totalCaution + totalUnsafe
  const mostFrequent = totalItems > 0
    ? totalSafe > totalCaution && totalSafe > totalUnsafe
      ? ('safe' as const)
      : totalCaution > totalUnsafe
        ? ('caution' as const)
        : ('unsafe' as const)
    : ('safe' as const)

  const analytics: UserAnalytics = {
    id: user.id,
    user_id: user.id,
    total_scans: scans.length,
    total_safe_items: totalSafe,
    total_caution_items: totalCaution,
    total_unsafe_items: totalUnsafe,
    favorite_restaurants: topRestaurants,
    most_frequent_safety_level: mostFrequent,
    updated_at: new Date().toISOString(),
  }

  return analytics
}
