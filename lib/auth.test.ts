import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { checkPin, sessionToken, isValidSession, safeEqual } from './auth'

const ORIGINAL = { ...process.env }

beforeEach(() => {
  process.env.APP_PIN = '1234'
  process.env.AUTH_SECRET = 'test-secret'
})
afterEach(() => {
  process.env = { ...ORIGINAL }
})

describe('checkPin', () => {
  it('akzeptiert nur den richtigen PIN', () => {
    expect(checkPin('1234')).toBe(true)
    expect(checkPin('1235')).toBe(false)
    expect(checkPin('')).toBe(false)
    expect(checkPin(1234)).toBe(false)
    expect(checkPin(undefined)).toBe(false)
  })
  it('lehnt alles ab, wenn kein APP_PIN gesetzt ist', () => {
    delete process.env.APP_PIN
    expect(checkPin('')).toBe(false)
    expect(checkPin('undefined')).toBe(false)
  })
})

describe('Session-Cookie', () => {
  it('enthält nicht den PIN', () => {
    const token = sessionToken()!
    expect(token).toMatch(/^[0-9a-f]{64}$/)
    expect(token).not.toContain('1234')
  })
  it('akzeptiert nur das passende Token', () => {
    const token = sessionToken()!
    expect(isValidSession(token)).toBe(true)
    expect(isValidSession('1234')).toBe(false) // alter Cookie-Inhalt (Klartext-PIN)
    expect(isValidSession(undefined)).toBe(false)
  })
  it('wird nach PIN-Wechsel ungültig', () => {
    const token = sessionToken()!
    process.env.APP_PIN = '9999'
    expect(isValidSession(token)).toBe(false)
  })
  it('ohne PIN/Schlüssel gibt es keine gültige Session', () => {
    delete process.env.AUTH_SECRET
    delete process.env.POSTGRES_URL
    expect(sessionToken()).toBeNull()
    expect(isValidSession('')).toBe(false)
  })
})

describe('safeEqual', () => {
  it('vergleicht auch unterschiedlich lange Strings ohne zu werfen', () => {
    expect(safeEqual('a', 'a')).toBe(true)
    expect(safeEqual('a', 'ab')).toBe(false)
  })
})
