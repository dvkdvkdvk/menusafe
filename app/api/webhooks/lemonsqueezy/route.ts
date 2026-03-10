import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Lemon Squeezy webhook handler
// Automatically activates Pro subscriptions when payment is received

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(req: Request) {
  const signature = req.headers.get('x-signature') || ''
  const rawBody = await req.text()
  
  // Verify webhook signature
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const eventName = event.meta?.event_name
  const customData = event.meta?.custom_data || {}
  // Prefer user_id from custom data, fall back to email lookup
  const userId = customData.user_id
  const userEmail = customData.user_email || event.data?.attributes?.user_email

  // Handle subscription events
  if (eventName === 'subscription_created' || eventName === 'subscription_payment_success') {
    let targetUserId = userId

    // If no user_id in custom data, look up by email
    if (!targetUserId && userEmail) {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
      const user = authData?.users?.find(u => u.email === userEmail)
      targetUserId = user?.id
    }

    if (!targetUserId) {
      console.error('Could not identify user from webhook payload')
      return Response.json({ error: 'No user identified' }, { status: 400 })
    }

    // Upgrade user to Pro
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: targetUserId,
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_provider: 'lemonsqueezy',
        subscription_id: event.data?.id,
      }, { onConflict: 'id' })

    console.log(`User ${targetUserId} upgraded to Pro`)
    return Response.json({ received: true })
  }

  // Handle subscription cancellation
  if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
    let targetUserId = userId

    if (!targetUserId && userEmail) {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
      const user = authData?.users?.find(u => u.email === userEmail)
      targetUserId = user?.id
    }

    if (targetUserId) {
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'cancelled',
        })
        .eq('id', targetUserId)
      
      console.log(`User ${targetUserId} subscription cancelled`)
    }

    return Response.json({ received: true })
  }

  // Acknowledge other events
  return Response.json({ received: true })
}
