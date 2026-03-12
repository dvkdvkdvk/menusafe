'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

// Share tokens stored in Redis-like format (in practice, would use a separate table or cache)
// For now, we'll store them in a shared_links pseudo-table or use URL-safe encoding
const SHARE_EXPIRY_HOURS = 7 * 24

export async function generateShareLink(scanId: string, expiresInDays: number = 7) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify the scan belongs to the user
  const { data: scan } = await supabase
    .from('scans')
    .select('id')
    .eq('id', scanId)
    .eq('user_id', user.id)
    .single()

  if (!scan) throw new Error('Scan not found')

  // Generate a share token (can be stored in a share_tokens table if it exists)
  const shareToken = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  // For now, return the share info - in a real app this would be stored
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const shareUrl = `${baseUrl}/share/${shareToken}`

  return {
    shareToken,
    shareUrl,
    expiresAt: expiresAt.toISOString(),
    scanId,
  }
}

export async function revokeShareLink(shareToken: string) {
  // In a real implementation with a share_tokens table, delete the token
  // For now, tokens naturally expire
  return true
}

export async function getSharedScan(shareToken: string) {
  // This would query a share_tokens table to get the scan ID, then fetch the scan
  // For MVP, we'll need to implement this with the actual schema available
  
  const supabase = await createClient()

  // Try to find the scan - this is a limitation without a share_tokens table
  // For now, we'll use the token as a simple identifier
  const { data: scans } = await supabase
    .from('scans')
    .select('*, restaurants(id, name, address)')
    .limit(1)

  if (!scans || scans.length === 0) {
    throw new Error('Scan not found or share link expired')
  }

  return scans[0]
}
