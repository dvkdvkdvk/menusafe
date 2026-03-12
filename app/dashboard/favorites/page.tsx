import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { SafetyBadge } from '@/components/safety-badge'
import { Heart, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { Favorite } from '@/lib/types'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('favorites')
    .eq('id', user.id)
    .single()

  const favorites = (profile?.favorites as Favorite[]) || []

  // Group favorites by restaurant
  const favoritesByRestaurant: { [key: string]: Favorite[] } = {}
  favorites.forEach((fav) => {
    if (!favoritesByRestaurant[fav.menu_item_name]) {
      favoritesByRestaurant[fav.menu_item_name] = []
    }
    favoritesByRestaurant[fav.menu_item_name].push(fav)
  })

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
            {favorites.length === 0 ? 'No favorites yet' : `${favorites.length} favorite item${favorites.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No favorites yet</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Mark safe items as favorites when scanning menus to save them here
            </p>
            <Link href="/dashboard/scan" className="mt-4 text-sm text-primary hover:underline">
              Start scanning →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Favorites List */}
      {favorites.length > 0 && (
        <div className="flex flex-col gap-3">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="rounded-xl">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{favorite.menu_item_name}</h3>
                  {favorite.menu_item_reason && (
                    <p className="mt-1 text-sm text-muted-foreground">{favorite.menu_item_reason}</p>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Saved on {new Date(favorite.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <SafetyBadge level={favorite.menu_item_safety} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
