'use server'

import { createClient } from '@/lib/supabase/server'
import type { MenuItem } from '@/lib/types'

interface RestaurantRecommendation {
  restaurantId: string
  restaurantName: string
  safetyScore: number
  totalSafeDishes: number
  recentScanDate: string
  reason: string
}

export async function getRestaurantRecommendations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's dietary restrictions
  const { data: profile } = await supabase
    .from('profiles')
    .select('dietary_mode, gluten_free, lactose_free')
    .eq('id', user.id)
    .single()

  // Get all restaurants for this user with their scans
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, lat, lng, scans(menu_items, created_at)')
    .eq('user_id', user.id)

  if (!restaurants) return []

  // Calculate recommendations
  const recommendations: RestaurantRecommendation[] = restaurants
    .map((restaurant) => {
      let totalItems = 0
      let safeItems = 0
      let mostRecentDate = ''

      for (const scan of restaurant.scans || []) {
        const items = (scan.menu_items || []) as MenuItem[]
        totalItems += items.length
        safeItems += items.filter((i) => i.safety === 'safe').length

        if (!mostRecentDate || new Date(scan.created_at) > new Date(mostRecentDate)) {
          mostRecentDate = scan.created_at
        }
      }

      const safetyScore = totalItems > 0 ? Math.round((safeItems / totalItems) * 100) : 0

      return {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        safetyScore,
        totalSafeDishes: safeItems,
        recentScanDate: mostRecentDate,
        reason:
          safetyScore >= 80
            ? 'Excellent choice - highest safety rating'
            : safetyScore >= 60
              ? 'Good option - many safe items'
              : 'Limited safe options - check carefully',
      }
    })
    .filter((r) => r.safetyScore >= 60) // Only recommend restaurants with 60%+ safe items
    .sort((a, b) => b.safetyScore - a.safetyScore)
    .slice(0, 5) // Top 5 recommendations

  return recommendations
}

export async function getNearbyRestaurants(lat: number, lng: number, radiusKm: number = 5) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all restaurants for this user
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, address, lat, lng, scans(menu_items)')
    .eq('user_id', user.id)

  if (!restaurants) return []

  // Calculate distance using Haversine formula
  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filter and sort by distance
  const nearby = restaurants
    .filter((r) => r.lat && r.lng && getDistance(lat, lng, r.lat, r.lng) <= radiusKm)
    .map((r) => {
      let safeItems = 0
      let totalItems = 0
      for (const scan of r.scans || []) {
        const items = (scan.menu_items || []) as MenuItem[]
        totalItems += items.length
        safeItems += items.filter((i) => i.safety === 'safe').length
      }
      const safetyScore = totalItems > 0 ? Math.round((safeItems / totalItems) * 100) : 0

      return {
        ...r,
        distance: getDistance(lat, lng, r.lat!, r.lng!),
        safetyScore,
      }
    })
    .sort((a, b) => a.distance - b.distance)

  return nearby
}
