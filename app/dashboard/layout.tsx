import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardSyncWrapper } from '@/components/dashboard-sync-wrapper'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background md:flex-row">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <Suspense fallback={null}>
          <DashboardSyncWrapper>
            {children}
          </DashboardSyncWrapper>
        </Suspense>
      </main>
    </div>
  )
}
