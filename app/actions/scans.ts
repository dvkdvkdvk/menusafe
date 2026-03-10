'use server'

import { createClient } from '@/lib/supabase/server'
import type { MenuItem } from '@/lib/types'

export async function saveScan({
  restaurantName,
  restaurantAddress,
  restaurantLat,
  restaurantLng,
  menuItems,
  rawText,
  dietaryMode,
}: {
  restaurantName: string
  restaurantAddress?: string
  restaurantLat?: number
  restaurantLng?: number
  menuItems: MenuItem[]
  rawText: string | null
  dietaryMode: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Upsert restaurant
  let restaurantId: string | null = null
  if (restaurantName.trim()) {
    const { data: existing } = await supabase
      .from('restaurants')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', restaurantName.trim())
      .maybeSingle()

    if (existing) {
      restaurantId = existing.id
      // Update location if provided
      if (restaurantLat && restaurantLng) {
        await supabase
          .from('restaurants')
          .update({ lat: restaurantLat, lng: restaurantLng })
          .eq('id', existing.id)
      }
    } else {
      const { data: newRestaurant, error } = await supabase
        .from('restaurants')
        .insert({
          user_id: user.id,
          name: restaurantName.trim(),
          address: restaurantAddress?.trim() || null,
          lat: restaurantLat || null,
          lng: restaurantLng || null,
        })
        .select('id')
        .single()
      if (error) throw error
      restaurantId = newRestaurant.id
    }
  }

  // Save scan
  const { data: scan, error } = await supabase
    .from('scans')
    .insert({
      user_id: user.id,
      restaurant_id: restaurantId,
      menu_items: menuItems,
      raw_text: rawText,
      dietary_mode: dietaryMode,
    })
    .select('id')
    .single()

  if (error) throw error

  // Increment monthly scan count
  const { data: profile } = await supabase
    .from('profiles')
    .select('monthly_scan_count, scan_count_reset_at')
    .eq('id', user.id)
    .single()

  if (profile) {
    const resetAt = profile.scan_count_reset_at ? new Date(profile.scan_count_reset_at) : null
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Reset count if we're in a new month
    const shouldReset = !resetAt || resetAt < startOfMonth
    const newCount = shouldReset ? 1 : (profile.monthly_scan_count || 0) + 1

    await supabase
      .from('profiles')
      .update({ 
        monthly_scan_count: newCount,
        scan_count_reset_at: shouldReset ? now.toISOString() : profile.scan_count_reset_at
      })
      .eq('id', user.id)
  }

  // Update restaurant safety score if we have a restaurant
  if (restaurantId) {
    // Get all scans for this restaurant to calculate aggregate score
    const { data: allScans } = await supabase
      .from('scans')
      .select('menu_items')
      .eq('restaurant_id', restaurantId)

    if (allScans) {
      let totalItems = 0
      let safeItems = 0

      for (const s of allScans) {
        const items = s.menu_items as MenuItem[]
        totalItems += items.length
        safeItems += items.filter(i => i.safety === 'safe').length
      }

      // Calculate safety score (0-100)
      const safetyScore = totalItems > 0 
        ? Math.round((safeItems / totalItems) * 100)
        : 0

      // Update restaurant with new safety score
      await supabase
        .from('restaurants')
        .update({ safety_score: safetyScore })
        .eq('id', restaurantId)
    }
  }

  return scan.id
}
