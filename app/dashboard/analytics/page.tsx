import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserAnalytics } from '@/app/actions/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SafetyPieChart, SafetyBarChart } from '@/components/analytics-charts'
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import type { MenuItem } from '@/lib/types'

export default async function AnalyticsDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const analytics = await getUserAnalytics()

  // Get scan history for chart
  const { data: scans } = await supabase
    .from('scans')
    .select('created_at, menu_items, restaurants(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // Group scans by week for chart
  const scansByWeek: { [key: string]: { safe: number; caution: number; unsafe: number } } = {}
  scans?.forEach((scan) => {
    const date = new Date(scan.created_at)
    const weekStart = new Date(date)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!scansByWeek[weekKey]) {
      scansByWeek[weekKey] = { safe: 0, caution: 0, unsafe: 0 }
    }

    const items = (scan.menu_items || []) as MenuItem[]
    items.forEach((item) => {
      scansByWeek[weekKey][item.safety as 'safe' | 'caution' | 'unsafe']++
    })
  })

  const chartData = Object.entries(scansByWeek).map(([week, data]) => ({
    week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ...data,
  }))

  const safetyData = [
    { name: 'Safe', value: analytics.total_safe_items, color: '#10b981' },
    { name: 'Caution', value: analytics.total_caution_items, color: '#f59e0b' },
    { name: 'Unsafe', value: analytics.total_unsafe_items, color: '#ef4444' },
  ]

  const totalItems = analytics.total_safe_items + analytics.total_caution_items + analytics.total_unsafe_items
  const safePercentage = totalItems > 0 ? Math.round((analytics.total_safe_items / totalItems) * 100) : 0

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Your Dining Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your dietary patterns and restaurant history
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Scans</div>
            <div className="mt-2 text-3xl font-bold text-foreground">{analytics.total_scans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-safe" />
              <span className="text-sm text-muted-foreground">Safe Items</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-safe">{analytics.total_safe_items}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-caution" />
              <span className="text-sm text-muted-foreground">Caution Items</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-caution">{analytics.total_caution_items}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-unsafe" />
              <span className="text-sm text-muted-foreground">Unsafe Items</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-unsafe">{analytics.total_unsafe_items}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Safety Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SafetyPieChart data={safetyData} totalItems={totalItems} />
          </CardContent>
        </Card>

        {/* Items Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Items by Safety Level Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <SafetyBarChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      {/* Favorite Restaurants */}
      {analytics.favorite_restaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Favorite Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.favorite_restaurants.map((restaurant, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-semibold text-foreground">{restaurant}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">#{idx + 1} Most Visited</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
