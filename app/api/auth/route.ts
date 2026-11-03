import { NextRequest, NextResponse } from 'next/server'
import { checkPin, sessionToken, PIN_COOKIE, COOKIE_MAX_AGE } from '@/lib/auth'

// Bremse gegen PIN-Durchprobieren: max. Fehlversuche pro IP im Zeitfenster.
// Nur im Speicher der jeweiligen Server-Instanz — keine harte Garantie, macht
// Raten aber deutlich langsamer (Fluid Compute nutzt Instanzen wieder).
const MAX_FAILS = 10
const WINDOW_MS = 15 * 60 * 1000
const FAIL_DELAY_MS = 1000
const fails = new Map<string, { count: number; resetAt: number }>()

function clientIp(req: NextRequest): string {
  // Vercel setzt/überschreibt diese Header selbst (nicht vom Client fälschbar)
  return req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const now = Date.now()
  // Abgelaufene Einträge aufräumen, damit die Map nicht unbegrenzt wächst
  if (fails.size > 1000) {
    for (const [k, v] of fails) if (v.resetAt <= now) fails.delete(k)
  }
  const entry = fails.get(ip)
  const current = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + WINDOW_MS }
  if (current.count >= MAX_FAILS) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }
  // Versuch sofort zählen (vor dem ersten await) — sonst kämen viele parallele
  // Anfragen gleichzeitig an der Prüfung vorbei. Bei Erfolg wird zurückgesetzt.
  fails.set(ip, { ...current, count: current.count + 1 })

  const body = await req.json().catch(() => null)
  const token = sessionToken()
  if (!token || !checkPin(body?.pin)) {
    await new Promise(r => setTimeout(r, FAIL_DELAY_MS))
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
  }

  fails.delete(ip)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(PIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
