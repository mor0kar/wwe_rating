import type { Metadata, Viewport } from 'next'
import { Oswald } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'
import TopNav from './components/TopNav'

// Athletic/Condensed Display-Font für Headlines, Wordmark und Scores
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Squared Circle Ratings',
  description: 'Wöchentliche Show-Bewertungen für Foffi, Jan, Björn & Curry',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Squared Circle',
  },
  icons: {
    apple: '/icons/icon.svg',
  },
}

// viewport ist in Next.js 15+ ein separater Export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={oswald.variable}>
      <body className="bg-zinc-950 min-h-screen antialiased">
        <TopNav />
        {/* Auf Desktop: Abstand für die fixe TopNav (56px = h-14) */}
        <div className="lg:pt-14">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  )
}
