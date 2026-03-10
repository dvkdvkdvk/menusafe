import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle errors from Supabase (e.g., expired link)
  if (error) {
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      // If the code is invalid or expired, redirect to error page
      const errorUrl = new URL('/auth/error', origin)
      errorUrl.searchParams.set('error', 'invalid_code')
      errorUrl.searchParams.set('error_description', exchangeError.message)
      return NextResponse.redirect(errorUrl)
    }

    // Successfully authenticated - redirect to dashboard
    return NextResponse.redirect(new URL(next, origin))
  }

  // No code provided
  return NextResponse.redirect(new URL('/auth/login', origin))
}
