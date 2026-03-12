'use server'

import { createClient } from '@/lib/supabase/server'
import type { Favorite } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export async function toggleFavorite(scanId: string, itemName: string, itemSafety: string, itemReason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Store favorites as a JSON field in the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('favorites')
    .eq('id', user.id)
    .single()

  let favorites = (profile?.favorites as Favorite[]) || []
  
  const existingIndex = favorites.findIndex(f => f.scan_id === scanId && f.menu_item_name === itemName)
  
  if (existingIndex >= 0) {
    // Remove favorite
    favorites = favorites.filter((_, i) => i !== existingIndex)
  } else {
    // Add favorite
    const newFavorite: Favorite = {
      id: uuidv4(),
      user_id: user.id,
      scan_id: scanId,
      menu_item_name: itemName,
      menu_item_safety: itemSafety as any,
      menu_item_reason: itemReason,
      created_at: new Date().toISOString(),
    }
    favorites.push(newFavorite)
  }

  await supabase
    .from('profiles')
    .update({ favorites })
    .eq('id', user.id)

  return favorites
}

export async function getFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('favorites')
    .eq('id', user.id)
    .single()

  return (profile?.favorites as Favorite[]) || []
}

export async function isFavorite(scanId: string, itemName: string) {
  const favorites = await getFavorites()
  return favorites.some(f => f.scan_id === scanId && f.menu_item_name === itemName)
}
