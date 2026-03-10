import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://v0-menu-safe-app-development.vercel.app'),
  title: {
    default: 'MenuSafe - Dine with Confidence, Not Compromise',
    template: '%s | MenuSafe',
  },
  description:
    'AI-powered menu scanner for food allergies and dietary restrictions. Scan any restaurant menu and instantly discover safe dishes for gluten-free, dairy-free, vegan, nut-free, and 25+ other diets.',
  keywords: [
    'food allergy app',
    'menu scanner',
    'gluten free restaurants',
    'dairy free dining',
    'vegan restaurant finder',
    'nut allergy safe food',
    'celiac disease app',
    'lactose intolerance',
    'dietary restrictions',
    'allergen detection',
    'restaurant allergy app',
    'food intolerance',
    'AI menu analysis',
    'safe dining',
  ],
  authors: [{ name: 'MenuSafe' }],
  creator: 'MenuSafe',
  publisher: 'MenuSafe',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MenuSafe',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MenuSafe',
    title: 'MenuSafe - Dine with Confidence, Not Compromise',
    description: 'AI-powered menu scanner for 25+ dietary restrictions. Scan any restaurant menu and instantly know what\'s safe to eat.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuSafe - Dine with Confidence',
    description: 'AI-powered menu scanner for food allergies. Scan any menu, know what\'s safe.',
    creator: '@menusafeapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'food & health',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a4d2e' },
    { media: '(prefers-color-scheme: dark)', color: '#0f2d1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-512x512.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MenuSafe" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
