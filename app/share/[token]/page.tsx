import { getSharedScan } from '@/app/actions/sharing'
import { SafetyBadge } from '@/components/safety-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Clock, AlertCircle } from 'lucide-react'
import type { MenuItem } from '@/lib/types'
import Link from 'next/link'

export default async function SharedScanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  
  let scan
  let error: string | null = null

  try {
    scan = await getSharedScan(token)
  } catch (err) {
    error = (err as Error).message
  }

  if (error || !scan) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Alert className="border-unsafe/20 bg-unsafe/5">
          <AlertCircle className="h-4 w-4 text-unsafe" />
          <AlertDescription className="text-unsafe">
            {error || 'Shared scan not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const menuItems = (scan.menu_items || []) as MenuItem[]
  const restaurant = scan.restaurants as { id: string; name: string; address: string | null } | null

  const safe = menuItems.filter(i => i.safety === 'safe').length
  const caution = menuItems.filter(i => i.safety === 'caution').length
  const unsafe = menuItems.filter(i => i.safety === 'unsafe').length

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {restaurant?.name || 'Menu Scan'}
        </h1>
        <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
          {restaurant?.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {restaurant.address}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatDate(scan.created_at)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="rounded-xl">
          <CardContent className="px-3 py-3 sm:px-4 sm:py-4">
            <div className="text-xs text-muted-foreground sm:text-sm">Safe Items</div>
            <div className="mt-1 text-xl font-bold text-safe sm:text-2xl">{safe}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="px-3 py-3 sm:px-4 sm:py-4">
            <div className="text-xs text-muted-foreground sm:text-sm">Caution Items</div>
            <div className="mt-1 text-xl font-bold text-caution sm:text-2xl">{caution}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="px-3 py-3 sm:px-4 sm:py-4">
            <div className="text-xs text-muted-foreground sm:text-sm">Unsafe Items</div>
            <div className="mt-1 text-xl font-bold text-unsafe sm:text-2xl">{unsafe}</div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Menu Items</h2>
        <div className="flex flex-col gap-3">
          {menuItems.map((item, idx) => (
            <Card key={idx} className="rounded-xl">
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                  {item.ingredients_of_concern && item.ingredients_of_concern.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.ingredients_of_concern.map((ingredient, i) => (
                        <span
                          key={i}
                          className="inline-block rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <SafetyBadge level={item.safety} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          This scan was shared with you via MenuSafe
        </p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/">Get MenuSafe</Link>
        </Button>
      </div>
    </div>
  )
}
