import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="transition-transform duration-200 hover:scale-105">
          <Logo size="md" />
        </Link>
        
        {/* Center links - hidden on mobile */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:underline hover:underline-offset-4">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:underline hover:underline-offset-4">
            How it works
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:underline hover:underline-offset-4">
            Pricing
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-sm font-medium transition-all duration-200 hover:bg-muted hover:text-foreground" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button size="sm" className="rounded-full bg-primary px-5 text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-md" asChild>
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
