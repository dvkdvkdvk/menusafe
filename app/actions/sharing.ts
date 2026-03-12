'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function generateShareLink(scanId: string, expiresInDays: number = 7) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Generate share token
  const shareToken = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  // Update scan with share info
  const { error } = await supabase
    .from('scans')
    .update({
      is_shareable: true,
      share_token: shareToken,
      share_expires_at: expiresAt.toISOString(),
    })
    .eq('id', scanId)
    .eq('user_id', user.id)

  if (error) throw error

  // Generate share URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const shareUrl = `${baseUrl}/share/${shareToken}`

  return {
    shareToken,
    shareUrl,
    expiresAt: expiresAt.toISOString(),
  }
}

export async function revokeShareLink(scanId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('scans')
    .update({
      is_shareable: false,
      share_token: null,
      share_expires_at: null,
    })
    .eq('id', scanId)
    .eq('user_id', user.id)

  if (error) throw error

  return true
}

export async function getSharedScan(shareToken: string) {
  const supabase = await createClient()

  const { data: scan, error } = await supabase
    .from('scans')
    .select('*, restaurants(id, name, address)')
    .eq('share_token', shareToken)
    .eq('is_shareable', true)
    .single()

  if (error || !scan) throw new Error('Scan not found or share link expired')

  // Check if share link is still valid
  if (scan.share_expires_at) {
    const expiresAt = new Date(scan.share_expires_at)
    if (expiresAt < new Date()) {
      throw new Error('Share link has expired')
    }
  }

  return scan
}
