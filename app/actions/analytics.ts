'use server'

import { createClient } from '@/lib/supabase/server'
import type { UserAnalytics, ScanAnalytics } from '@/lib/types'
import type { MenuItem } from '@/lib/types'

export async function trackScanAnalytics(scanId: string, menuItems: MenuItem[], restaurantName?: string) {
  // Analytics are tracked passively through the scans table
  // No need to actively track - we calculate them on demand in getUserAnalytics
  return {
    id: scanId,
    user_id: '',
    scan_id: scanId,
    items_analyzed: menuItems.length,
    safe_percentage: Math.round((menuItems.filter(i => i.safety === 'safe').length / menuItems.length) * 100),
    dietary_mode_used: 'strict',
    restaurant_name: restaurantName,
    timestamp: new Date().toISOString(),
  }
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
