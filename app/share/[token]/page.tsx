import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default async function SharedScanPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-600">
          Shareable links feature is coming soon. For now, please share screenshots of your scan results.
        </AlertDescription>
      </Alert>
    </div>
  )
}
}
