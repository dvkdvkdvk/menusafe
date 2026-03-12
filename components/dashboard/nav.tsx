'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ScanLine, Settings, LogOut, Store, Shield, BarChart3, Heart, Lightbulb } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

// Admin emails - must match the list in app/admin/page.tsx
const ADMIN_EMAILS = ['estudiomotim@gmail.com']

const links = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/scan', label: 'Scan', icon: ScanLine },
  { href: '/dashboard/restaurants', label: 'Restaurants', icon: Store },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && ADMIN_EMAILS.includes(user.email || '')) {
        setIsAdmin(true)
      }
    }
    checkAdmin()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Mobile top bar - Clean minimal style */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
        <button
          onClick={handleSignOut}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile bottom navigation - Floating pill style */}
      <nav className="fixed inset-x-0 bottom-4 z-50 mx-4 md:hidden">
        <div className="flex items-center justify-around rounded-full bg-background px-2 py-2 shadow-lg ring-1 ring-border/50">
          {links.map((link) => {
            const isActive = link.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(link.href) && link.href !== '/dashboard'
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-2xl px-4 py-2 text-xs font-semibold transition-all',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <link.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                <span className="text-[10px] tracking-wide">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop sidebar - Dark Graza style */}
      <aside className="hidden w-60 shrink-0 bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="px-5 py-6">
          <Logo variant="white" size="lg" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {links.map((link) => {
            const isActive = link.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                pathname === '/admin'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Shield className="h-5 w-5" />
              Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
