'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'

interface DashboardSyncWrapperProps {
  children: React.ReactNode
}

export function DashboardSyncWrapper({ children }: DashboardSyncWrapperProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // If we just came from a successful checkout, wait for webhook to process
    if (searchParams.get('session') === 'success') {
      setIsSyncing(true)
      
      // Wait 3 seconds for the webhook to update the database
      const timer = setTimeout(() => {
        setIsSyncing(false)
        // Clean up the URL
        router.replace('/dashboard')
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  if (isSyncing) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 font-serif text-xl font-semibold tracking-tight text-foreground">
          Activating Pro features...
        </h2>
        <p className="mb-6 text-muted-foreground">
          Just a moment while we set up your account.
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
