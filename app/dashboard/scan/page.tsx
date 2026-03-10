'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MultiImageUpload } from '@/components/multi-image-upload'
import { MenuItemCard } from '@/components/menu-item-card'
import { SafetyBadge } from '@/components/safety-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { saveScan } from '@/app/actions/scans'
import type { MenuItem } from '@/lib/types'
import { ScanLine, Save, Loader2, CheckCircle, AlertTriangle, XCircle, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { DIETARY_RESTRICTIONS } from '@/lib/dietary-restrictions'
import { canScan, formatScansRemaining, type SubscriptionTier } from '@/lib/subscription'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Profile {
  id: string
  gluten_free: boolean
  lactose_free: boolean
  dietary_mode: 'strict' | 'mild'
  dietary_restrictions?: string[]
  subscription_tier?: SubscriptionTier
  monthly_scan_count?: number
}

type AnalysisState = 'idle' | 'analyzing' | 'done' | 'error'

export default function ScanPage() {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [restaurantName, setRestaurantName] = useState('')
  const [restaurantAddress, setRestaurantAddress] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [state, setState] = useState<AnalysisState>('idle')
  const [items, setItems] = useState<MenuItem[]>([])
  const [rawText, setRawText] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast('Location not available', {
        description: 'Your browser does not support geolocation. You can still enter the address manually.',
      })
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationLoading(false)
        toast.success('Location captured')
      },
      (error) => {
        setLocationLoading(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast('Location permission denied', {
            description: 'You can still enter the address manually.',
          })
        } else {
          toast('Location unavailable', {
            description: 'Could not get your location. This is optional - you can enter the address manually.',
          })
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // Load user profile for dietary settings - reload on every mount to get fresh settings
  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !mounted) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data && mounted) {
        setProfile(data as Profile)
      }
    }
    loadProfile()
    return () => { mounted = false }
  }, [])

  const handleAnalyze = async () => {
    if (images.length === 0 || !profile) return
    
    // Check scan limits
    const tier = profile.subscription_tier || 'free'
    const count = profile.monthly_scan_count || 0
    if (!canScan(tier, count)) {
      setErrorMsg('You have reached your monthly scan limit. Upgrade to Pro for unlimited scans.')
      setState('error')
      return
    }
    
    setState('analyzing')
    setErrorMsg('')
    setItems([])

  try {
    // Get restrictions from new field or migrate from legacy booleans
    let restrictions = profile.dietary_restrictions || []
    if (restrictions.length === 0) {
      if (profile.gluten_free) restrictions.push('gluten')
      if (profile.lactose_free) restrictions.push('dairy')
    }
    
    let res: Response
      try {
        res = await fetch('/api/analyze-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images,
            dietaryMode: profile.dietary_mode,
            restrictions, // New comprehensive restrictions array
            // Legacy fields for backwards compatibility
            glutenFree: profile.gluten_free,
            lactoseFree: profile.lactose_free,
          }),
        })
      } catch (fetchError) {
        // Network error - no response at all
        console.error('[v0] Fetch failed:', fetchError)
        throw new Error('Network error. Please check your connection and try again.')
      }

      let data
      try {
        data = await res.json()
      } catch {
        throw new Error('Invalid response from server. Please try again.')
      }
      
      if (!res.ok) {
        // Include debug info if available
        const debugInfo = data.debug ? `\n\nDebug: ${data.debug}` : ''
        throw new Error((data.error || 'Analysis failed') + debugInfo)
      }

      setItems(data.result.items)
      setRawText(data.result.raw_text)
      setState('done')
    } catch (err) {
      console.error('[v0] Analysis error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  const handleSave = async () => {
    if (items.length === 0 || !profile) return
    setIsSaving(true)
    try {
      const scanId = await saveScan({
        restaurantName: restaurantName || 'Unknown Restaurant',
        restaurantAddress: restaurantAddress || undefined,
        restaurantLat: location?.lat,
        restaurantLng: location?.lng,
        menuItems: items,
        rawText,
        dietaryMode: profile.dietary_mode,
      })
      toast.success('Scan saved successfully')
      router.push(`/dashboard/scan/${scanId}`)
    } catch {
      toast.error('Failed to save scan')
    } finally {
      setIsSaving(false)
    }
  }

  const safeCount = items.filter((i) => i.safety === 'safe').length
  const cautionCount = items.filter((i) => i.safety === 'caution').length
  const unsafeCount = items.filter((i) => i.safety === 'unsafe').length

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
<h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Scan menu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Take a photo of any restaurant menu
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Restaurant info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Restaurant Details
            </CardTitle>
            <CardDescription>Optional - helps organize your scan history</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input
                id="restaurant-name"
                placeholder="e.g. The Italian Kitchen"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                disabled={state === 'analyzing'}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="restaurant-address">Address</Label>
              <div className="flex gap-2">
                <Input
                  id="restaurant-address"
                  placeholder="e.g. 123 Main St, City"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  disabled={state === 'analyzing'}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={getLocation}
                  disabled={locationLoading || state === 'analyzing'}
                  title="Use current location"
                  className="shrink-0"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {location && (
                <p className="text-xs text-muted-foreground">
                  Location saved ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image upload */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Menu Photo
            </CardTitle>
            <CardDescription>Take a clear photo of the menu for best results</CardDescription>
          </CardHeader>
          <CardContent>
            <MultiImageUpload images={images} onChange={setImages} disabled={state === 'analyzing'} maxImages={10} />
          </CardContent>
        </Card>

        {/* Scan limit display */}
        {profile && (
          <div className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
            canScan(profile.subscription_tier || 'free', profile.monthly_scan_count || 0)
              ? 'border-border bg-card'
              : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
          }`}>
            <span className="font-medium">
              {formatScansRemaining(profile.subscription_tier || 'free', profile.monthly_scan_count || 0)}
            </span>
            {(!profile.subscription_tier || profile.subscription_tier === 'free') && (
              <Link href="/pricing" className="text-primary hover:underline">
                Upgrade for unlimited
              </Link>
            )}
          </div>
        )}

        {/* Profile info display */}
        {profile && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="text-muted-foreground">Checking for:</span>
            {(() => {
              const restrictions = profile.dietary_restrictions || []
              const displayRestrictions = restrictions.length > 0 ? restrictions : [
                ...(profile.gluten_free ? ['gluten'] : []),
                ...(profile.lactose_free ? ['dairy'] : []),
              ]
              return displayRestrictions.map(id => {
                const r = DIETARY_RESTRICTIONS.find(r => r.id === id)
                return r ? (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {r.icon} {r.name}
                  </Badge>
                ) : null
              })
            })()}
            {(!profile.dietary_restrictions?.length && !profile.gluten_free && !profile.lactose_free) && (
              <span className="text-amber-600">No restrictions set - <a href="/dashboard/settings" className="underline">configure in settings</a></span>
            )}
            <span className="text-muted-foreground">
              ({profile.dietary_mode === 'strict' ? 'Strict' : 'Mild'} mode)
            </span>
          </div>
        )}

        {/* Analyze button - full width on mobile */}
        <Button
          size="lg"
          className="h-12 gap-2 text-base sm:h-11 sm:text-sm"
          onClick={handleAnalyze}
          disabled={images.length === 0 || state === 'analyzing' || !profile}
        >
          {state === 'analyzing' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin sm:h-4 sm:w-4" />
              Analyzing menu...
            </>
          ) : (
            <>
              <ScanLine className="h-5 w-5 sm:h-4 sm:w-4" />
              Analyze Menu
            </>
          )}
        </Button>

        {/* Error */}
        {state === 'error' && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Results */}
        {state === 'done' && items.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Summary stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle className="h-6 w-6 text-safe" />
                    <span className="text-2xl font-bold text-foreground">{safeCount}</span>
                    <span className="text-xs text-muted-foreground">Safe</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <AlertTriangle className="h-6 w-6 text-caution" />
                    <span className="text-2xl font-bold text-foreground">{cautionCount}</span>
                    <span className="text-xs text-muted-foreground">Caution</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="h-6 w-6 text-unsafe" />
                    <span className="text-2xl font-bold text-foreground">{unsafeCount}</span>
                    <span className="text-xs text-muted-foreground">Unsafe</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safe items */}
            {safeCount > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <SafetyBadge level="safe" />
                  <span>{safeCount} dish{safeCount !== 1 ? 'es' : ''} you can eat</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {items.filter((i) => i.safety === 'safe').map((item, idx) => (
                    <MenuItemCard key={idx} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Caution items */}
            {cautionCount > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <SafetyBadge level="caution" />
                  <span>{cautionCount} dish{cautionCount !== 1 ? 'es' : ''} to ask about</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {items.filter((i) => i.safety === 'caution').map((item, idx) => (
                    <MenuItemCard key={idx} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Unsafe items */}
            {unsafeCount > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <SafetyBadge level="unsafe" />
                  <span>{unsafeCount} dish{unsafeCount !== 1 ? 'es' : ''} to avoid</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {items.filter((i) => i.safety === 'unsafe').map((item, idx) => (
                    <MenuItemCard key={idx} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Save button - sticky on mobile */}
            <div className="sticky bottom-24 z-10 -mx-4 bg-gradient-to-t from-background via-background to-transparent px-4 pb-2 pt-6 sm:static sm:mx-0 sm:bg-none sm:p-0">
              <Button 
                size="lg" 
                className="h-12 w-full gap-2 text-base shadow-lg sm:h-11 sm:w-auto sm:text-sm sm:shadow-none" 
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin sm:h-4 sm:w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 sm:h-4 sm:w-4" />
                    Save Scan
                  </>
                )}
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-muted-foreground">
              MenuSafe is an assistive tool. Always confirm with restaurant
              staff for critical dietary needs.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
