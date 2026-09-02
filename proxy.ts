import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PIN_COOKIE } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/cron']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()

  const auth = request.cookies.get(PIN_COOKIE)
  if (auth?.value === process.env.APP_PIN) return NextResponse.next()

  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  // Statische Artwork-/PWA-Dateien (Header, Logos, Manifest) sind nicht schützenswert —
  // sie vom PIN-Check auszunehmen spart Middleware-Invocations und hält das
  // PWA-Manifest auch ohne Cookie erreichbar (sonst bricht "Add to Homescreen").
  matcher: ['/((?!_next/static|_next/image|favicon.ico|header.jpg|icons/|manifest.webmanifest).*)'],
}
