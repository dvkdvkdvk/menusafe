'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MenuItemCard } from '@/components/menu-item-card'
import { SafetyBadge } from '@/components/safety-badge'
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Calendar, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ScanLine,
  Trash2,
  Pencil,
  Phone,
  Globe,
  X,
  Save
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { MenuItem } from '@/lib/types'

interface Scan {
  id: string
  menu_items: MenuItem[]
  dietary_mode: string
  created_at: string
}

interface Restaurant {
  id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  phone?: string | null
  website?: string | null
  notes?: string | null
  created_at: string
  scans: Scan[]
}

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteScanTarget, setDeleteScanTarget] = useState<Scan | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    notes: '',
  })

  const startEditing = () => {
    if (restaurant) {
      setEditForm({
        name: restaurant.name,
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        website: restaurant.website || '',
        notes: restaurant.notes || '',
      })
      setIsEditing(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!restaurant) return
    setSaving(true)
    
    const supabase = createClient()
    // Only update columns that exist in the database
    const { error } = await supabase
      .from('restaurants')
      .update({
        name: editForm.name.trim() || restaurant.name,
        address: editForm.address.trim() || null,
      })
      .eq('id', restaurant.id)

    if (error) {
      console.error('[v0] Restaurant update error:', error)
      toast.error('Failed to update restaurant')
    } else {
      setRestaurant({
        ...restaurant,
        name: editForm.name.trim() || restaurant.name,
        address: editForm.address.trim() || null,
      })
      toast.success('Restaurant updated')
      setIsEditing(false)
    }
    setSaving(false)
  }

  const handleDeleteScan = async (scan: Scan) => {
    setDeleting(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('scans')
      .delete()
      .eq('id', scan.id)

    if (error) {
      toast.error('Failed to delete scan')
    } else {
      if (restaurant) {
        const updatedScans = restaurant.scans.filter(s => s.id !== scan.id)
        if (updatedScans.length === 0) {
          // Delete restaurant if no scans left
          await supabase.from('restaurants').delete().eq('id', restaurant.id)
          toast.success('Scan deleted. Restaurant removed (no scans remaining).')
          router.push('/dashboard/restaurants')
          return
        }
        setRestaurant({ ...restaurant, scans: updatedScans })
      }
      toast.success('Scan deleted')
    }
    setDeleting(false)
    setDeleteScanTarget(null)
  }

  useEffect(() => {
    async function loadRestaurant() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sign-in')
        return
      }

      // Note: phone, website, notes columns may not exist yet
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          lat,
          lng,
          created_at,
          scans (
            id,
            menu_items,
            dietary_mode,
            created_at
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        console.error('Error loading restaurant:', error)
        router.push('/dashboard/restaurants')
        return
      }

      // Sort scans by date, newest first
      const sortedScans = (data.scans || []).sort(
        (a: Scan, b: Scan) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setRestaurant({ ...data, scans: sortedScans } as Restaurant)
      setLoading(false)
    }

    loadRestaurant()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!restaurant) {
    return null
  }

  // Aggregate all menu items from all scans
  const allItems: MenuItem[] = []
  const itemMap = new Map<string, MenuItem>()

  for (const scan of restaurant.scans) {
    for (const item of scan.menu_items as MenuItem[]) {
      // Use item name as key to avoid duplicates
      const key = item.name.toLowerCase().trim()
      if (!itemMap.has(key)) {
        itemMap.set(key, item)
        allItems.push(item)
      }
    }
  }

  const safeItems = allItems.filter(i => i.safety === 'safe')
  const cautionItems = allItems.filter(i => i.safety === 'caution')
  const unsafeItems = allItems.filter(i => i.safety === 'unsafe')

  // Build Google Maps navigation URL
  const hasLocation = restaurant.lat && restaurant.lng
  const navigationUrl = hasLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`
    : restaurant.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`
    : null

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:py-10">
      {/* Header with back button */}
      <div className="mb-6">
        <Link 
          href="/dashboard/restaurants"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Restaurants
        </Link>
        
        {isEditing ? (
          /* Edit Form */
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Edit Restaurant</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Restaurant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="123 Main St, City"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEdit} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Display Mode */
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                  {restaurant.name}
                </h1>
                {restaurant.address && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {restaurant.address}
                  </p>
                )}
                {restaurant.phone && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <a href={`tel:${restaurant.phone}`} className="hover:underline">{restaurant.phone}</a>
                  </p>
                )}
                {restaurant.website && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 shrink-0" />
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">
                      {restaurant.website.replace(/^https?:\/\//, '')}
                    </a>
                  </p>
                )}
                {restaurant.notes && (
                  <p className="mt-2 text-sm text-muted-foreground italic">
                    {restaurant.notes}
                  </p>
                )}
              </div>
              <Button variant="outline" size="icon" onClick={startEditing}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              {navigationUrl && (
                <Button asChild size="lg" className="h-12 flex-1 gap-2 text-base sm:h-11 sm:flex-none sm:text-sm">
                  <a href={navigationUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-5 w-5 sm:h-4 sm:w-4" />
                    Navigate
                  </a>
                </Button>
              )}
              {restaurant.phone && (
                <Button asChild variant="outline" size="lg" className="h-12 flex-1 gap-2 text-base sm:h-11 sm:flex-none sm:text-sm">
                  <a href={`tel:${restaurant.phone}`}>
                    <Phone className="h-5 w-5 sm:h-4 sm:w-4" />
                    Call
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Summary Stats */}
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
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Based on {restaurant.scans.length} scan{restaurant.scans.length !== 1 ? 's' : ''} • {allItems.length} unique items analyzed
          </p>
        </CardContent>
      </Card>

      {/* All analyzed dishes */}
      <div className="flex flex-col gap-6">
        {/* Safe items */}
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

        {/* Caution items */}
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

        {/* Unsafe items */}
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

        {/* Scan History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Scan History
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {restaurant.scans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <Link href={`/dashboard/scan/${scan.id}`} className="flex flex-1 items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(scan.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(scan.menu_items as MenuItem[]).length} items • {scan.dietary_mode} mode
                    </p>
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteScanTarget(scan)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scan Again Button */}
        <Button asChild size="lg" variant="outline" className="h-12 gap-2 text-base sm:h-11 sm:text-sm">
          <Link href="/dashboard/scan">
            <ScanLine className="h-5 w-5 sm:h-4 sm:w-4" />
            Scan Menu Again
          </Link>
        </Button>
      </div>

      {/* Delete Scan Confirmation Dialog */}
      <AlertDialog open={!!deleteScanTarget} onOpenChange={() => setDeleteScanTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scan from {new Date(deleteScanTarget?.created_at || '').toLocaleDateString()}. 
              {restaurant?.scans.length === 1 && ' Since this is the only scan, the restaurant will also be removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteScanTarget && handleDeleteScan(deleteScanTarget)}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
