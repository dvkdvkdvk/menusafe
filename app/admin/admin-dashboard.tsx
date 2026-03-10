'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  ScanLine,
  ArrowLeft,
  Search,
  Crown,
  Mail,
  Calendar,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Logo } from '@/components/brand/logo'

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: string
  subscription_status: string | null
  subscription_id: string | null
  subscription_current_period_end: string | null
  monthly_scan_count: number
  created_at: string
}

interface AdminDashboardProps {
  users: User[]
  stats: {
    totalUsers: number
    proUsers: number
    activeSubscriptions: number
    totalScans: number
  }
}

export function AdminDashboard({ users, stats }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'pro'>('all')
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier
    return matchesSearch && matchesTier
  })
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const mrr = stats.proUsers * 2.90 // Monthly recurring revenue
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Logo size="md" />
            <Badge variant="secondary" className="ml-2">Admin</Badge>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="https://app.lemonsqueezy.com/customers" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Lemon Squeezy
            </a>
          </Button>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                All registered accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pro Subscribers
              </CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.proUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active Pro accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{mrr.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                MRR from subscriptions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Scans
              </CardTitle>
              <ScanLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <a href="https://app.lemonsqueezy.com" target="_blank" rel="noopener noreferrer">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Revenue Analytics
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="https://app.lemonsqueezy.com/customers" target="_blank" rel="noopener noreferrer">
              <Users className="mr-2 h-4 w-4" />
              Manage in Lemon Squeezy
            </a>
          </Button>
        </div>
        
        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Users</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {filterTier === 'all' ? 'All tiers' : filterTier === 'pro' ? 'Pro only' : 'Free only'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterTier('all')}>
                      All tiers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterTier('pro')}>
                      Pro only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterTier('free')}>
                      Free only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Plan</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Scans</th>
                    <th className="pb-3 pr-4 font-medium">Joined</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                              {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name || 'No name'}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge 
                            variant={user.subscription_tier === 'pro' ? 'default' : 'secondary'}
                            className={user.subscription_tier === 'pro' ? 'bg-primary' : ''}
                          >
                            {user.subscription_tier === 'pro' ? (
                              <><Crown className="mr-1 h-3 w-3" /> Pro</>
                            ) : (
                              'Free'
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={
                            user.subscription_status === 'active' ? 'border-green-500 text-green-600' :
                            user.subscription_status === 'cancelled' ? 'border-red-500 text-red-600' :
                            ''
                          }>
                            {user.subscription_status || 'free'}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-sm">
                          {user.monthly_scan_count || 0}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <a href={`mailto:${user.email}`}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Email user
                                </a>
                              </DropdownMenuItem>
                              {user.subscription_id && (
                                <DropdownMenuItem asChild>
                                  <a 
                                    href={`https://app.lemonsqueezy.com/subscriptions/${user.subscription_id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View in Lemon Squeezy
                                  </a>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
