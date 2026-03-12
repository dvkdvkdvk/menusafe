'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SafetyBadge } from '@/components/safety-badge'
import { ChevronRight, Store, Loader2, ScanLine, Trash2, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface Restaurant {
  id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  created_at: string
  scans: {
    id: string
    menu_items: MenuItem[]
    created_at: string
  }[]
}

interface RestaurantWithStats extends Restaurant {
  totalItems: number
  safeItems: number
  cautionItems: number
  unsafeItems: number
  safetyScore: number // 0-100, higher is safer
  lastScanDate: string
}

function calculateRestaurantStats(restaurant: Restaurant): RestaurantWithStats {
  let totalItems = 0
  let safeItems = 0
  let cautionItems = 0
  let unsafeItems = 0
  let lastScanDate = restaurant.created_at

  for (const scan of restaurant.scans) {
    const items = scan.menu_items as MenuItem[]
    totalItems += items.length
    safeItems += items.filter(i => i.safety === 'safe').length
    cautionItems += items.filter(i => i.safety === 'caution').length
    unsafeItems += items.filter(i => i.safety === 'unsafe').length
    if (new Date(scan.created_at) > new Date(lastScanDate)) {
      lastScanDate = scan.created_at
    }
  }

  // Calculate safety score: safe items boost score, unsafe items reduce it
  const safetyScore = totalItems > 0 
    ? Math.round(((safeItems * 2 + cautionItems * 0.5) / (totalItems * 2)) * 100)
    : 0

  return {
    ...restaurant,
    totalItems,
    safeItems,
    cautionItems,
    unsafeItems,
    safetyScore,
    lastScanDate,
  }
}

function getSafetyLevel(score: number): 'safe' | 'caution' | 'unsafe' {
  if (score >= 70) return 'safe'
  if (score >= 40) return 'caution'
  return 'unsafe'
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<RestaurantWithStats | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [safetyFilter, setSafetyFilter] = useState<'all' | 'safe' | 'caution' | 'unsafe'>('all')

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const safetyLevel = getSafetyLevel(r.safetyScore)
    const matchesSafety = safetyFilter === 'all' || safetyLevel === safetyFilter
    return matchesSearch && matchesSafety
  })

  const handleDelete = async (restaurant: RestaurantWithStats) => {
    setDeleting(true)
    const supabase = createClient()
    
    // Delete all scans first (cascade), then restaurant
    const { error: scansError } = await supabase
      .from('scans')
      .delete()
      .eq('restaurant_id', restaurant.id)
    
    if (scansError) {
      toast.error('Failed to delete restaurant scans')
      setDeleting(false)
      return
    }

    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', restaurant.id)

    if (error) {
      toast.error('Failed to delete restaurant')
    } else {
      setRestaurants(prev => prev.filter(r => r.id !== restaurant.id))
      toast.success('Restaurant deleted')
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  useEffect(() => {
    async function loadRestaurants() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading restaurants:', error)
        setLoading(false)
        return
      }

      // Calculate stats and sort by safety score
      const restaurantsWithStats = (data || [])
        .map(r => calculateRestaurantStats(r as Restaurant))
        .sort((a, b) => b.safetyScore - a.safetyScore) // Safest first

      setRestaurants(restaurantsWithStats)
      setLoading(false)
    }

    loadRestaurants()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My Restaurants
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by safety from your scans
        </p>
      </div>

      {/* Search and Filter */}
      {restaurants.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary flex-1"
          />
          <select
            value={safetyFilter}
            onChange={(e) => setSafetyFilter(e.target.value as any)}
            className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Safety Levels</option>
            <option value="safe">Safe Only</option>
            <option value="caution">Caution Only</option>
            <option value="unsafe">Unsafe Only</option>
          </select>
        </div>
      )}

      {restaurants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No restaurants yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan a menu to add your first restaurant
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/scan">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Menu
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredRestaurants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No matching restaurants</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRestaurants.map((restaurant, index) => {
            const safetyLevel = getSafetyLevel(restaurant.safetyScore)
            
            return (
              <Link 
                key={restaurant.id} 
                href={`/dashboard/restaurants/${restaurant.id}`}
                className="block"
              >
                <Card className="rounded-2xl transition-all hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Rank Badge */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      safetyLevel === 'safe' ? 'bg-safe/10 text-safe' :
                      safetyLevel === 'caution' ? 'bg-caution/10 text-caution' :
                      'bg-unsafe/10 text-unsafe'
                    }`}>
                      #{restaurants.indexOf(restaurant) + 1}
                    </div>

                    {/* Restaurant Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-foreground">{restaurant.name}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{restaurant.scans.length} scan{restaurant.scans.length !== 1 ? 's' : ''}</span>
                        <span>{restaurant.totalItems} dishes</span>
                      </div>
                    </div>

                    {/* Safety Stats */}
                    <div className="hidden shrink-0 items-center gap-3 sm:flex">
                      <div className="flex items-center gap-1.5">
                        <SafetyBadge level="safe" showIcon={false} />
                        <span className="text-sm text-foreground">{restaurant.safeItems}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <SafetyBadge level="caution" showIcon={false} />
                        <span className="text-sm text-foreground">{restaurant.cautionItems}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <SafetyBadge level="unsafe" showIcon={false} />
                        <span className="text-sm text-foreground">{restaurant.unsafeItems}</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.preventDefault()
                            setDeleteTarget(restaurant)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot; and all {deleteTarget?.scans.length || 0} associated scans. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
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
