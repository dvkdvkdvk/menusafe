import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  // Use service role key for schema changes
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Check if dietary_restrictions column exists by trying to query it
    const { error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('dietary_restrictions')
      .limit(1)

    if (checkError && checkError.message.includes('dietary_restrictions')) {
      // Column doesn't exist, need to add it via raw SQL
      // This requires the pg extension or direct database access
      return NextResponse.json({ 
        success: false, 
        message: 'Column does not exist. Please run this SQL in your Supabase dashboard: ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT \'[]\'::jsonb;',
        needsMigration: true
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'dietary_restrictions column exists',
      needsMigration: false
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
