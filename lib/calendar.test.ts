import { describe, it, expect } from 'vitest'
import {
  localStartTime,
  zonedInstant,
  eventInstant,
  germanWatchTime,
  type CalendarEvent,
} from './calendar'

describe('localStartTime (+30-Min-Offset auf Listenzeit)', () => {
  const base: CalendarEvent = { date: '2026-06-08', type: 'RAW', city: 'X', tz: 'Europe/Berlin' }

  it('Default 20:00 ohne hinterlegte Zeit (kein Offset)', () => {
    expect(localStartTime({ ...base })).toBe('20:00')
  })
  it('addiert 30 Min auf die Listenzeit', () => {
    expect(localStartTime({ ...base, localTime: '19:30' })).toBe('20:00')
    expect(localStartTime({ ...base, localTime: '18:00' })).toBe('18:30')
  })
  it('rollt über Mitternacht', () => {
    expect(localStartTime({ ...base, localTime: '23:45' })).toBe('00:15')
  })
})

describe('zonedInstant (DST-sichere Wanduhr → UTC)', () => {
  it('Europe/Berlin im Sommer (CEST, UTC+2)', () => {
    expect(zonedInstant('2026-06-15', '20:00', 'Europe/Berlin').toISOString())
      .toBe('2026-06-15T18:00:00.000Z')
  })
  it('Europe/Berlin im Winter (CET, UTC+1)', () => {
    expect(zonedInstant('2026-01-15', '20:00', 'Europe/Berlin').toISOString())
      .toBe('2026-01-15T19:00:00.000Z')
  })
  it('America/New_York im Sommer (EDT, UTC-4) → nächster UTC-Tag', () => {
    expect(zonedInstant('2026-07-04', '20:00', 'America/New_York').toISOString())
      .toBe('2026-07-05T00:00:00.000Z')
  })
})

describe('eventInstant', () => {
  it('kombiniert Datum, effektive Startzeit und Zeitzone', () => {
    const ev: CalendarEvent = {
      date: '2026-06-08', type: 'RAW', city: 'Paris', tz: 'Europe/Paris', localTime: '19:30',
    }
    // 19:30 + 30 = 20:00 Paris (CEST) = 18:00 UTC
    expect(eventInstant(ev).toISOString()).toBe('2026-06-08T18:00:00.000Z')
  })
})

describe('germanWatchTime', () => {
  it('EU-Abendshow: selber Tag, live machbar', () => {
    const ev: CalendarEvent = {
      date: '2026-06-08', type: 'RAW', city: 'Paris', tz: 'Europe/Paris', localTime: '19:30',
    }
    const w = germanWatchTime(ev)
    expect(w.time).toBe('20:00')
    expect(w.dayOffset).toBe(0)
    expect(w.dateLabel).toBe('08.06.')
    expect(w.liveFriendly).toBe(true)
  })

  it('US-Nachtshow (Mo): +1 Tag, 02:00 DE, nicht live machbar', () => {
    const ev: CalendarEvent = {
      date: '2026-07-20', type: 'RAW', city: 'Detroit', tz: 'America/Detroit', localTime: '19:30',
    }
    const w = germanWatchTime(ev)
    expect(w.time).toBe('02:00')
    expect(w.dayOffset).toBe(1)
    expect(w.weekday).toBe('Di.')
    expect(w.dateLabel).toBe('21.07.')
    expect(w.liveFriendly).toBe(false)
  })
})
