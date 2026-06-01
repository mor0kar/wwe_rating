import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import {
  getUpcomingEvents,
  eventInstant,
  germanWatchTime,
  airsOnLabel,
  zonedInstant,
  type CalendarEvent,
} from '@/lib/calendar'

export const dynamic = 'force-dynamic'

const SITE = process.env.SITE_URL ?? 'https://wwe-rater.vercel.app'

// --- Datums-Helfer (in Europe/Berlin) ---------------------------------
function berlinDateISO(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(d)
}
function addDaysISO(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
function fmtDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

function showLabel(e: CalendarEvent): string {
  if (e.type === 'SNM') return 'SNME'
  if (e.type === 'PLE') return e.title || 'PLE'
  return e.type
}

// --- Nachricht zusammenbauen ------------------------------------------
async function buildMessage(now: Date): Promise<string | null> {
  const events = getUpcomingEvents()
  const todayISO = berlinDateISO(now)
  const weekday = new Date(todayISO + 'T12:00:00Z').getUTCDay() // 0 So .. 6 Sa

  // Fenster "heute + kommende Nacht": [heute 06:00, morgen 06:00) in Berlin
  const startMs = zonedInstant(todayISO, '06:00', 'Europe/Berlin').getTime()
  const endMs = zonedInstant(addDaysISO(todayISO, 1), '06:00', 'Europe/Berlin').getTime()

  const sections: string[] = []

  // 1) Wochen-Übersicht (nur Montags)
  if (weekday === 1) {
    const weekEndISO = addDaysISO(todayISO, 6)
    const weekEvents = events
      .filter(e => e.date >= todayISO && e.date <= weekEndISO)
      .sort((a, b) => a.date.localeCompare(b.date))
    if (weekEvents.length) {
      const lines = weekEvents.map(e => {
        const de = germanWatchTime(e)
        const wd = new Date(e.date + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short' })
        const tag = e.taped ? '📼 (Aufzeichnung)' : de.liveFriendly ? '📺 live machbar' : '🌙 Folgetag'
        return `• ${wd} ${fmtDate(e.date)} — **${showLabel(e)}** (${e.city}) · 🇩🇪 ${de.time} Uhr ${tag}`
      })
      sections.push(`📅 **Diese Woche**\n${lines.join('\n')}`)
    }
  }

  // 2) Heute / kommende Nacht — Show-Reminder + Taped-Spoiler-Warnung
  const todayShows = events.filter(e => {
    const t = eventInstant(e).getTime()
    return t >= startMs && t < endMs
  })
  if (todayShows.length) {
    const lines = todayShows.map(e => {
      const de = germanWatchTime(e)
      if (e.taped) {
        return `• ⚠️ **${showLabel(e)}** wird heute in ${e.city} aufgezeichnet — läuft erst **${e.airsOn ? airsOnLabel(e.airsOn) : 'später'}**. Social Media meiden! 🙈`
      }
      const tag = de.liveFriendly ? '📺 **live machbar**' : '🌙 lieber am Folgetag'
      const dayHint = de.dayOffset !== 0 ? ` (${de.weekday})` : ''
      return `• **${showLabel(e)}**${e.title && e.type !== 'PLE' ? ' – ' + e.title : ''} (${e.city}) — 🇩🇪 ${de.time} Uhr${dayHint} ${tag}`
    })
    sections.push(`🔔 **Heute**\n${lines.join('\n')}`)
  }

  // 3) Bewerten-Reminder — gelaufene Events ohne angelegte Show (letzte 14 Tage)
  const rows = (await sql`SELECT type, date FROM shows`) as unknown as { type: string; date: string }[]
  const have = new Set(rows.map(r => `${r.type}|${r.date}`))
  const cutoffISO = addDaysISO(todayISO, -14)
  const pending = events.filter(e => {
    const ratableDate = e.airsOn ?? e.date // getapte erst ab Ausstrahlung bewertbar
    return ratableDate < todayISO && ratableDate >= cutoffISO && !have.has(`${e.type}|${e.date}`)
  })
  if (pending.length) {
    const lines = pending
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => `• **${showLabel(e)}**${e.title && e.type !== 'PLE' ? ' – ' + e.title : ''} vom ${fmtDate(e.date)}`)
    sections.push(`📝 **Noch zu bewerten**\n${lines.join('\n')}\n→ ${SITE}/shows`)
  }

  if (!sections.length) return null
  return sections.join('\n\n')
}

async function run(): Promise<NextResponse> {
  const webhook = process.env.DISCORD_WEBHOOK_URL
  if (!webhook) {
    return NextResponse.json({ ok: false, error: 'DISCORD_WEBHOOK_URL nicht gesetzt' }, { status: 500 })
  }

  const content = await buildMessage(new Date())
  if (!content) {
    return NextResponse.json({ ok: true, posted: false, reason: 'nichts zu melden' })
  }

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Squared Circle Ratings', content: content.slice(0, 1990) }),
  })

  return NextResponse.json({ ok: res.ok, posted: res.ok, status: res.status })
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // wenn kein Secret gesetzt ist, nicht blockieren
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// Vercel-Cron ruft per GET auf; POST für manuelles Triggern erlaubt.
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return run()
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return run()
}
