import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

function getErrorMessage(error: string | null, description: string | null): { title: string; message: string } {
  if (error === 'access_denied' || error?.includes('otp_expired') || description?.includes('expired')) {
    return {
      title: 'Link Expired',
      message: 'Your email confirmation link has expired. Please sign up again to receive a new link.',
    }
  }
  if (error === 'invalid_code') {
    return {
      title: 'Invalid Link',
      message: description || 'The confirmation link is invalid. Please try signing up again.',
    }
  }
  return {
    title: 'Something went wrong',
    message: description || error || 'An unspecified authentication error occurred.',
  }
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams
  const { title, message } = getErrorMessage(params.error || null, params.error_description || null)

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-center text-sm text-muted-foreground">
                {message}
              </p>
              <div className="flex flex-col gap-2 w-full">
                <Button asChild>
                  <Link href="/auth/sign-up">Sign Up Again</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Back to Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
