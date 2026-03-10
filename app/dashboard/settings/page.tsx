'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, ShieldAlert, ShieldCheck, Check } from 'lucide-react'
import { DIETARY_RESTRICTIONS, RESTRICTION_CATEGORIES, getRestrictionsByCategory } from '@/lib/dietary-restrictions'
import { cn } from '@/lib/utils'
import { reanalyzeScans } from '@/app/actions/reanalyze'

interface Profile {
  id: string
  gluten_free: boolean
  lactose_free: boolean
  dietary_mode: 'strict' | 'mild'
  dietary_restrictions?: string[]
  subscription_tier?: string
  monthly_scan_count?: number
  actual_scan_count?: number
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalRestrictions, setOriginalRestrictions] = useState<string[]>([])
  const [originalMode, setOriginalMode] = useState<'strict' | 'mild'>('strict')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile')
      } else {
        // Count actual scans this month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        
        const { count: scanCount } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth)
        
        setProfile({ ...data, actual_scan_count: scanCount || 0 })
        // Load dietary restrictions from new field or migrate from old fields
        let restrictions: string[] = data.dietary_restrictions || []
        if (restrictions.length === 0) {
          // Migrate from old boolean fields
          if (data.gluten_free) restrictions.push('gluten')
          if (data.lactose_free) restrictions.push('dairy')
        }
        setSelectedRestrictions(restrictions)
        setOriginalRestrictions(restrictions)
        setOriginalMode(data.dietary_mode || 'strict')
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  // Check for any changes (restrictions or mode)
  const checkForChanges = (newRestrictions: string[], newMode: 'strict' | 'mild') => {
    const restrictionsChanged = JSON.stringify(newRestrictions.sort()) !== JSON.stringify(originalRestrictions.sort())
    const modeChanged = newMode !== originalMode
    setHasChanges(restrictionsChanged || modeChanged)
  }

  const toggleRestriction = (id: string) => {
    setSelectedRestrictions(prev => {
      const newRestrictions = prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
      checkForChanges(newRestrictions, profile?.dietary_mode || 'strict')
      return newRestrictions
    })
  }

  const handleModeChange = (value: 'strict' | 'mild') => {
    if (profile) {
      setProfile({ ...profile, dietary_mode: value })
      checkForChanges(selectedRestrictions, value)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)

    // Save all settings including dietary_restrictions
    const updateData = {
      gluten_free: selectedRestrictions.includes('gluten'),
      lactose_free: selectedRestrictions.includes('dairy'),
      dietary_restrictions: selectedRestrictions,
      dietary_mode: profile.dietary_mode,
      updated_at: new Date().toISOString(),
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id)

    if (error) {
      toast.error('Failed to save settings: ' + error.message)
      setSaving(false)
      return
    }
    
    // Update local profile state
    setProfile({
      ...profile,
      ...updateData,
    })

    // Auto-reanalyze all scans with new restrictions using server action
    let reanalyzeCount = 0
    try {
      const result = await reanalyzeScans(selectedRestrictions, profile.dietary_mode)
      reanalyzeCount = result.count || 0
    } catch {
      // Reanalyze failed silently - settings were still saved
    }
    
    // Show success message
    if (reanalyzeCount > 0) {
      toast.success(`Settings saved! Updated ${reanalyzeCount} scan${reanalyzeCount !== 1 ? 's' : ''}.`)
    } else {
      toast.success('Settings saved!')
    }
    
    setOriginalRestrictions(selectedRestrictions)
    setOriginalMode(profile.dietary_mode)
    setHasChanges(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Unable to load profile</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 sm:px-6 sm:py-10 sm:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your dietary preferences
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Subscription Status */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Subscription</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your current plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={profile.subscription_tier === 'free' || !profile.subscription_tier ? 'secondary' : 'default'}>
                  {profile.subscription_tier?.toUpperCase() || 'FREE'}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  {profile.actual_scan_count ?? profile.monthly_scan_count ?? 0} / {profile.subscription_tier === 'pro' || profile.subscription_tier === 'family' ? 'Unlimited' : '3'} scans this month
                </p>
              </div>
              {(!profile.subscription_tier || profile.subscription_tier === 'free') && (
                <Button variant="outline" asChild>
                  <a href="/pricing">Upgrade</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dietary Restrictions */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Dietary Restrictions
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Select all that apply. The AI will check menus for these items.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {RESTRICTION_CATEGORIES.map(category => (
              <div key={category.id}>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {getRestrictionsByCategory(category.id).map(restriction => {
                    const isSelected = selectedRestrictions.includes(restriction.id)
                    return (
                      <button
                        key={restriction.id}
                        onClick={() => toggleRestriction(restriction.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border p-3 text-left transition-all",
                          isSelected 
                            ? "border-primary bg-primary/10 ring-1 ring-primary" 
                            : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <span className="text-lg">{restriction.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "truncate text-sm font-medium",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {restriction.name}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            
            {selectedRestrictions.length > 0 && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Selected ({selectedRestrictions.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRestrictions.map(id => {
                    const r = DIETARY_RESTRICTIONS.find(r => r.id === id)
                    return r ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {r.icon} {r.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Mode */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Analysis Mode
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose how cautious the AI should be
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Select
                value={profile.dietary_mode}
                onValueChange={handleModeChange}
              >
                <SelectTrigger className="h-11 w-full sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      <span>Strict Mode</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mild">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Mild Mode</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="rounded-lg border bg-muted/50 p-3">
                {profile.dietary_mode === 'strict' ? (
                  <div className="flex gap-2.5">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Strict Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Best for severe allergies. Any contamination risk is flagged.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2.5">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Mild Mode</p>
                      <p className="text-xs text-muted-foreground">
                        For mild intolerances. Only definite ingredients flagged.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="sticky bottom-24 z-10 -mx-4 bg-gradient-to-t from-background via-background to-transparent px-4 pb-2 pt-4 sm:static sm:mx-0 sm:bg-none sm:p-0">
          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges} 
            className="h-12 w-full gap-2 text-base shadow-lg sm:h-10 sm:text-sm sm:shadow-none"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving & updating scans...
              </>
            ) : hasChanges ? (
              'Save & Update Scans'
            ) : (
              'No changes to save'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
