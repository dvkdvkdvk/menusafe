import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <Card className="border-border bg-card">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="heading-serif text-2xl font-medium">
                Check your email
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {"We've sent you a confirmation link"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Please check your email inbox and click the confirmation link to
                activate your account. Once confirmed, you can{' '}
                <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4">
                  sign in
                </Link>{' '}
                and start scanning menus.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
