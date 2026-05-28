import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WWE Rater',
  description: 'Wöchentliche Show-Bewertungen',
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
