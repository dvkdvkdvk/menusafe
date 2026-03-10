import Link from "next/link"
import { Logo } from "@/components/brand/logo"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-foreground px-4 py-16 text-background sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          {/* Brand */}
          <Logo variant="white" size="md" />

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/pricing" className="text-background/70 transition-all duration-200 hover:text-background hover:underline hover:underline-offset-4">
              Pricing
            </Link>
            <Link href="/contact" className="text-background/70 transition-all duration-200 hover:text-background hover:underline hover:underline-offset-4">
              Contact
            </Link>
            <Link href="/privacy" className="text-background/70 transition-all duration-200 hover:text-background hover:underline hover:underline-offset-4">
              Privacy
            </Link>
            <Link href="/terms" className="text-background/70 transition-all duration-200 hover:text-background hover:underline hover:underline-offset-4">
              Terms
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-background/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-background/60 sm:flex-row">
            <p>2026 MenuSafe. All rights reserved.</p>
            <p className="max-w-md text-center sm:text-right">
              MenuSafe is an assistive tool. Always confirm with restaurant staff for critical dietary needs.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
