'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/shows', label: 'Shows' },
  { href: '/stats', label: 'Stats' },
  { href: '/upcoming', label: 'Kalender' },
  { href: '/settings', label: 'Einstellungen' },
]

export default function TopNav() {
  const pathname = usePathname()

  // Auf der Login-Seite keine Navigation zeigen
  if (pathname === '/login') return null

  const isActive = (href: string) =>
    pathname === href || (href !== '/shows' && pathname.startsWith(href + '/'))

  const isShowsActive =
    pathname === '/shows' ||
    (pathname.startsWith('/shows/') && !pathname.startsWith('/shows/add'))

  return (
    <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href="/shows"
          className="text-lg font-black italic uppercase tracking-tight text-white text-glow-red"
        >
          ⚡ SQUARED CIRCLE RATINGS
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(link => {
            const active =
              link.href === '/shows' ? isShowsActive : isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {/* Neu — hervorgehobener Button */}
          <Link
            href="/shows/add"
            className={`ml-2 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500 transition-colors ${
              pathname === '/shows/add' ? 'bg-red-500' : ''
            }`}
          >
            Neu
          </Link>
        </div>
      </div>
    </nav>
  )
}
