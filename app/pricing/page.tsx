import { Suspense } from 'react'
import { PricingContent } from './pricing-content'

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingPageSkeleton />}>
      <PricingContent />
    </Suspense>
  )
}

function PricingPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-6 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
