import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScanLine, CheckCircle, AlertTriangle, XCircle, ArrowRight, Clock } from 'lucide-react'
import { SafetyBadge } from '@/components/safety-badge'
import type { MenuItem } from '@/lib/types'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: recentScans } = await supabase
    .from('scans')
    .select('*, restaurants(id, name, address)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const scans = recentScans || []

  // Compute totals
  let totalSafe = 0, totalCaution = 0, totalUnsafe = 0
  for (const scan of scans) {
    const items = (scan.menu_items || []) as MenuItem[]
    totalSafe += items.filter((i) => i.safety === 'safe').length
    totalCaution += items.filter((i) => i.safety === 'caution').length
    totalUnsafe += items.filter((i) => i.safety === 'unsafe').length
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {scans.length === 0
              ? 'Start by scanning your first menu'
              : `You have ${scans.length} recent scan${scans.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2 rounded-full">
            <Link href="/dashboard/analytics">
              Analytics
            </Link>
          </Button>
          <Button asChild className="group h-12 gap-2 rounded-full bg-primary px-6 text-primary-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-lg sm:h-11">
            <Link href="/dashboard/scan">
              <ScanLine className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              New Scan
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats summary - compact inline */}
      {scans.length > 0 && (
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-safe" />
            <span className="text-sm font-medium text-foreground">{totalSafe}</span>
            <span className="text-xs text-muted-foreground">Safe</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-caution" />
            <span className="text-sm font-medium text-foreground">{totalCaution}</span>
            <span className="text-xs text-muted-foreground">Caution</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-unsafe" />
            <span className="text-sm font-medium text-foreground">{totalUnsafe}</span>
            <span className="text-xs text-muted-foreground">Avoid</span>
          </div>
        </div>
      )}

      {/* Empty state with sample analysis */}
      {scans.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="py-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <ScanLine className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No scans yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Scan your first menu to see results here
              </p>
              <Button asChild className="mt-4 gap-2 rounded-full">
                <Link href="/dashboard/scan">
                  <ScanLine className="h-4 w-4" />
                  Scan your first menu
                </Link>
              </Button>
            </div>
            
            {/* Sample Analysis - Left aligned */}
            <div className="border-t pt-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Sample Analysis
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                  <div className="text-left">
                    <p className="font-medium text-foreground">Grilled Salmon Bowl</p>
                    <p className="text-sm text-muted-foreground">No allergens detected</p>
                  </div>
                  <SafetyBadge level="safe" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                  <div className="text-left">
                    <p className="font-medium text-foreground">Classic Margherita</p>
                    <p className="text-sm text-muted-foreground">Contains gluten and dairy</p>
                  </div>
                  <SafetyBadge level="unsafe" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                  <div className="text-left">
                    <p className="font-medium text-foreground">Garden Salad</p>
                    <p className="text-sm text-muted-foreground">Check dressing ingredients</p>
                  </div>
                  <SafetyBadge level="caution" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent scans list */}
      {scans.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Recent scans
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {scans.map((scan, index) => {
              const items = (scan.menu_items || []) as MenuItem[]
              const safe = items.filter((i) => i.safety === 'safe').length
              const caution = items.filter((i) => i.safety === 'caution').length
              const unsafe = items.filter((i) => i.safety === 'unsafe').length
              const restaurant = scan.restaurants as { id: string; name: string; address: string | null } | null
              
              // Determine safety level for badge color
              const safetyScore = items.length > 0 
                ? Math.round(((safe * 2 + caution * 0.5) / (items.length * 2)) * 100)
                : 0
              const badgeLevel = safetyScore >= 70 ? 'safe' : safetyScore >= 40 ? 'caution' : 'unsafe'

              return (
                <Link key={scan.id} href={`/dashboard/scan/${scan.id}`}>
                  <Card className="group rounded-2xl border-2 border-transparent transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg">
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Index Badge */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        badgeLevel === 'safe' ? 'bg-safe/10 text-safe' :
                        badgeLevel === 'caution' ? 'bg-caution/10 text-caution' :
                        'bg-unsafe/10 text-unsafe'
                      }`}>
                        #{index + 1}
                      </div>
                      
                      {/* Scan Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                          {restaurant?.name || 'Unknown Restaurant'}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatDate(scan.created_at)}</span>
                          <span>{items.length} dishes</span>
                        </div>
                      </div>
                      
                      {/* Safety Stats - inline with numbers */}
                      <div className="hidden shrink-0 items-center gap-3 sm:flex">
                        <div className="flex items-center gap-1.5">
                          <SafetyBadge level="safe" showIcon={false} />
                          <span className="text-sm text-foreground">{safe}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <SafetyBadge level="caution" showIcon={false} />
                          <span className="text-sm text-foreground">{caution}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <SafetyBadge level="unsafe" showIcon={false} />
                          <span className="text-sm text-foreground">{unsafe}</span>
                        </div>
                      </div>
                      
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
