'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <WifiOff className="mb-6 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 font-serif text-2xl font-bold tracking-tight">You are offline</h1>
      <p className="mb-6 max-w-md text-muted-foreground">
        MenuSafe needs an internet connection to analyze menus.
        Please check your connection and try again.
      </p>
      <Button onClick={() => window.location.reload()} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  )
}
