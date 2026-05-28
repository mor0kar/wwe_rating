import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from './components/BottomNav'
import TopNav from './components/TopNav'

export const metadata: Metadata = {
  title: 'WWE Rater',
  description: 'Wöchentliche Show-Bewertungen für Foffi, Jan, Björn & Curry',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WWE Rater',
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
    <html lang="de">
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
