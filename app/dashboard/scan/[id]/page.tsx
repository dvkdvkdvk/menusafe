import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MenuItemCard } from '@/components/menu-item-card'
import { SafetyBadge } from '@/components/safety-badge'
import type { MenuItem } from '@/lib/types'
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, MapPin, Clock } from 'lucide-react'

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: scan } = await supabase
    .from('scans')
    .select('*, restaurants(id, name, address)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!scan) notFound()

  const items = (scan.menu_items || []) as MenuItem[]
  const restaurant = scan.restaurants as { id: string; name: string; address: string | null } | null
  const safeItems = items.filter((i) => i.safety === 'safe')
  const cautionItems = items.filter((i) => i.safety === 'caution')
  const unsafeItems = items.filter((i) => i.safety === 'unsafe')

  const createdAt = new Date(scan.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:py-10">
      {/* Back button */}
      <Link 
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          {restaurant?.name || 'Unknown Restaurant'}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {createdAt}
          </span>
          {restaurant?.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {restaurant.address}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Mode: {scan.dietary_mode === 'strict' ? 'Strict' : 'Mild'}</span>
          <span>|</span>
          <span>{items.length} dishes analyzed</span>
        </div>
      </div>

      {/* Summary */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <CheckCircle className="h-6 w-6 text-safe" />
              <span className="text-2xl font-bold text-foreground">{safeItems.length}</span>
              <span className="text-xs text-muted-foreground">Safe</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <AlertTriangle className="h-6 w-6 text-caution" />
              <span className="text-2xl font-bold text-foreground">{cautionItems.length}</span>
              <span className="text-xs text-muted-foreground">Caution</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <XCircle className="h-6 w-6 text-unsafe" />
              <span className="text-2xl font-bold text-foreground">{unsafeItems.length}</span>
              <span className="text-xs text-muted-foreground">Unsafe</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results by category */}
      <div className="flex flex-col gap-6">
        {safeItems.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <SafetyBadge level="safe" />
              <span>{safeItems.length} dish{safeItems.length !== 1 ? 'es' : ''} you can eat</span>
            </h3>
            <div className="flex flex-col gap-2">
              {safeItems.map((item, idx) => (
                <MenuItemCard key={idx} item={item} />
              ))}
            </div>
          </div>
        )}

        {cautionItems.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <SafetyBadge level="caution" />
              <span>{cautionItems.length} dish{cautionItems.length !== 1 ? 'es' : ''} to ask about</span>
            </h3>
            <div className="flex flex-col gap-2">
              {cautionItems.map((item, idx) => (
                <MenuItemCard key={idx} item={item} />
              ))}
            </div>
          </div>
        )}

        {unsafeItems.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <SafetyBadge level="unsafe" />
              <span>{unsafeItems.length} dish{unsafeItems.length !== 1 ? 'es' : ''} to avoid</span>
            </h3>
            <div className="flex flex-col gap-2">
              {unsafeItems.map((item, idx) => (
                <MenuItemCard key={idx} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        MenuSafe is an assistive tool. Always confirm with restaurant
        staff for critical dietary needs.
      </p>
    </div>
  )
}
