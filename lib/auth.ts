import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const PIN_COOKIE = 'wwe-rater-auth'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 Tage

// Konstante Laufzeit beim Vergleich (kein Timing-Leak). Hashen gleicht die
// Längen an, weil timingSafeEqual sonst wirft.
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function checkPin(input: unknown): boolean {
  const pin = process.env.APP_PIN
  if (!pin || typeof input !== 'string') return false
  return safeEqual(input, pin)
}

// Session-Token fürs Cookie: HMAC statt PIN im Klartext. So steht der PIN nie
// im Browser, und das Cookie lässt sich nicht durch Durchprobieren erraten.
// Schlüssel: AUTH_SECRET, sonst die (geheime) DB-URL als Fallback. PIN-Wechsel
// macht alle Sessions ungültig.
export function sessionToken(): string | null {
  const pin = process.env.APP_PIN
  const key = process.env.AUTH_SECRET || process.env.POSTGRES_URL
  if (!pin || !key) return null
  return createHmac('sha256', key).update(`wwe-rater-session:${pin}`).digest('hex')
}

export function isValidSession(cookieValue: string | undefined): boolean {
  const token = sessionToken()
  if (!token || !cookieValue) return false
  return safeEqual(cookieValue, token)
}
