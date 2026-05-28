import type { Metadata, Viewport } from 'next'
import './globals.css'

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
  themeColor: '#111827',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
