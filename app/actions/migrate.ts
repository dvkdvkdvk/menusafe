'use server'

import { createClient } from '@supabase/supabase-js'

export async function runMigration() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if column exists
  const { error: checkError } = await supabaseAdmin
    .from('profiles')
    .select('dietary_restrictions')
    .limit(1)

  if (checkError && checkError.message.includes('dietary_restrictions')) {
    return { 
      success: false, 
      needsMigration: true,
      message: 'Please run this SQL in your Supabase SQL Editor: ALTER TABLE profiles ADD COLUMN dietary_restrictions JSONB DEFAULT \'[]\'::jsonb;'
    }
  }

  return { success: true, needsMigration: false }
}

export async function checkMigrationStatus() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('profiles')
    .select('dietary_restrictions')
    .limit(1)

  return { 
    columnExists: !error || !error.message.includes('dietary_restrictions')
  }
}
