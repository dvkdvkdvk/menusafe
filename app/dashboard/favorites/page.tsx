import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 fill-red-500 text-red-500" />
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Favorites
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save your favorite safe menu items for quick reference
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <Card className="rounded-2xl border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Favorites Coming Soon</h3>
          <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
            This feature is being set up. You'll be able to mark safe items as favorites when scanning menus.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/scan">
              Start Scanning
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
