import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from './admin-dashboard'

// Add your email address here to restrict admin access
const ADMIN_EMAILS = ['estudiomotim@gmail.com']

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/dashboard')
  }
  
  // Fetch all users with their subscription data
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
  }
  
  // Calculate stats
  const totalUsers = users?.length || 0
  const proUsers = users?.filter(u => u.subscription_tier === 'pro').length || 0
  const activeSubscriptions = users?.filter(u => u.subscription_status === 'active').length || 0
  const totalScans = users?.reduce((acc, u) => acc + (u.monthly_scan_count || 0), 0) || 0
  
  return (
    <AdminDashboard 
      users={users || []}
      stats={{
        totalUsers,
        proUsers,
        activeSubscriptions,
        totalScans,
      }}
    />
  )
}
