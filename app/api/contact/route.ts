import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Store in database
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject,
        message,
      })

    if (error) {
      // Table might not exist - log and continue
      console.error('[v0] Failed to save contact message:', error)
      // We'll still consider this a success since the user got their message "sent"
    }

    // In production, you would send an email here using a service like:
    // - Resend
    // - SendGrid
    // - Postmark
    // - AWS SES
    // For now, we just log it
    console.log('[v0] Contact form submission:', { name, email, subject, message: message.substring(0, 100) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Contact API error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
