// lib/calendar.ts
// Einzige Quelle für kommende WWE-Termine.
// Aktuell: kuratierte Liste. Später austauschbar gegen eine API,
// ohne dass die UI angefasst werden muss — solange getUpcomingEvents()
// dieselbe Struktur (CalendarEvent[]) zurückgibt.

export type ShowType = 'RAW' | 'SmackDown' | 'PLE' | 'SNM'

export type CalendarEvent = {
  date: string        // offizielles lokales Event-Datum, YYYY-MM-DD
  type: ShowType
  title?: string
  venue: string
  city: string
  tz: string          // IANA-Zeitzone des Veranstaltungsorts
  localTime?: string  // lokale Startzeit HH:mm vor Ort (Default: 20:00)
}

// Standard-Annahme: WWE-TV-Shows starten 20:00 lokaler Ortszeit.
// Abweichende Startzeiten können pro Event über localTime gesetzt werden.
const DEFAULT_LOCAL_TIME = '20:00'

const EVENTS: CalendarEvent[] = [
  { date: '2026-05-29', type: 'SmackDown', venue: 'Olimpic Arena', city: 'Barcelona, Spain', tz: 'Europe/Madrid' },
  { date: '2026-05-31', type: 'PLE', title: 'Clash in Italy', venue: 'Inalpi Arena', city: 'Turin, Italy', tz: 'Europe/Rome' },
  { date: '2026-06-01', type: 'RAW', venue: 'Inalpi Arena', city: 'Turin, Italy', tz: 'Europe/Rome' },
  { date: '2026-06-05', type: 'SmackDown', venue: 'Unipol Arena', city: 'Bologna, Italy', tz: 'Europe/Rome' },
  { date: '2026-06-08', type: 'RAW', venue: 'Accor Arena', city: 'Paris, France', tz: 'Europe/Paris' },
  { date: '2026-06-15', type: 'RAW', venue: 'CFG Bank Arena', city: 'Baltimore, MD', tz: 'America/New_York' },
  { date: '2026-06-19', type: 'SmackDown', venue: 'T-Mobile Center', city: 'Kansas City, MO', tz: 'America/Chicago' },
  { date: '2026-06-22', type: 'RAW', venue: 'The O2', city: 'London, UK', tz: 'Europe/London' },
  { date: '2026-06-29', type: 'RAW', title: 'RAW/SmackDown', venue: "Jim Whelan's Boardwalk Hall", city: 'Atlantic City, NJ', tz: 'America/New_York' },
  { date: '2026-07-06', type: 'RAW', venue: 'Allstate Arena', city: 'Chicago, IL', tz: 'America/Chicago' },
  { date: '2026-07-10', type: 'SmackDown', venue: 'Paycom Center', city: 'Oklahoma City, OK', tz: 'America/Chicago' },
  { date: '2026-07-13', type: 'RAW', venue: 'American Airlines Arena', city: 'Dallas, TX', tz: 'America/Chicago' },
  { date: '2026-07-17', type: 'SmackDown', venue: 'MVP Arena', city: 'Albany, NY', tz: 'America/New_York' },
  { date: '2026-07-18', type: 'SNM', title: "Saturday Night's Main Event", venue: 'Madison Square Garden', city: 'New York, NY', tz: 'America/New_York' },
  { date: '2026-07-20', type: 'RAW', venue: 'Little Caesars Arena', city: 'Detroit, MI', tz: 'America/Detroit' },
  { date: '2026-07-24', type: 'SmackDown', venue: 'Oakland Arena', city: 'Oakland, CA', tz: 'America/Los_Angeles' },
  { date: '2026-07-27', type: 'RAW', venue: 'Intuit Dome', city: 'Inglewood, CA', tz: 'America/Los_Angeles' },
  { date: '2026-07-31', type: 'SmackDown', venue: 'Resch Center', city: 'Green Bay, WI', tz: 'America/Chicago' },
  { date: '2026-08-01', type: 'PLE', title: 'SummerSlam (Night One)', venue: 'US Bank Stadium', city: 'Minneapolis, MN', tz: 'America/Chicago', localTime: '19:00' },
  { date: '2026-08-02', type: 'PLE', title: 'SummerSlam (Night Two)', venue: 'US Bank Stadium', city: 'Minneapolis, MN', tz: 'America/Chicago', localTime: '19:00' },
  { date: '2026-08-03', type: 'RAW', venue: "Casey's Center", city: 'Des Moines, IA', tz: 'America/Chicago' },
  { date: '2026-08-10', type: 'RAW', venue: 'Scope Arena', city: 'Norfolk, VA', tz: 'America/New_York' },
  { date: '2026-08-17', type: 'RAW', venue: 'KeyBank Arena', city: 'Buffalo, NY', tz: 'America/New_York' },
  { date: '2026-08-28', type: 'SmackDown', venue: 'Rocket Mortgage FieldHouse', city: 'Cleveland, OH', tz: 'America/New_York' },
  { date: '2026-08-31', type: 'RAW', venue: 'Spectrum Center', city: 'Charlotte, NC', tz: 'America/New_York' },
  { date: '2026-09-04', type: 'SmackDown', venue: 'Heritage Bank Center', city: 'Cincinnati, OH', tz: 'America/New_York' },
  { date: '2026-09-06', type: 'PLE', title: 'Money in the Bank', venue: 'Smoothie King Center', city: 'New Orleans, LA', tz: 'America/Chicago' },
  { date: '2026-09-07', type: 'RAW', venue: 'Legacy Center at BJCC', city: 'Birmingham, AL', tz: 'America/Chicago' },
]

export function getUpcomingEvents(): CalendarEvent[] {
  return EVENTS
}

// --- Zeit-Helfer -------------------------------------------------------

// Offset (in ms) einer Zeitzone zum gegebenen Instant: (Zeit in tz) − UTC.
function tzOffsetMs(instant: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const map: Record<string, number> = {}
  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== 'literal') map[p.type] = Number(p.value)
  }
  const asUTC = Date.UTC(map.year, map.month - 1, map.day, map.hour % 24, map.minute, map.second)
  return asUTC - instant.getTime()
}

// Lokale Wanduhr-Zeit in tz → exakter UTC-Instant (DST-sicher).
export function eventInstant(ev: CalendarEvent): Date {
  const [y, m, d] = ev.date.split('-').map(Number)
  const [hh, mm] = (ev.localTime ?? DEFAULT_LOCAL_TIME).split(':').map(Number)
  const wallAsUTC = Date.UTC(y, m - 1, d, hh, mm)
  // Offset am ungefähren Instant bestimmen und korrigieren.
  const offset = tzOffsetMs(new Date(wallAsUTC), ev.tz)
  return new Date(wallAsUTC - offset)
}

// Deutsche Live-Zeit: Uhrzeit + Tagesversatz ggü. Event-Datum + Datums-Label.
export function germanWatchTime(ev: CalendarEvent): {
  time: string         // z.B. "02:00"
  dayOffset: number    // 0 = selber Tag, 1 = nächster Tag (typisch für US-Nachtshows)
  weekday: string      // z.B. "Di"
  dateLabel: string    // z.B. "02.06."
} {
  const instant = eventInstant(ev)
  const berlin = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin', hour12: false,
    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
  const map: Record<string, string> = {}
  for (const p of berlin.formatToParts(instant)) {
    if (p.type !== 'literal') map[p.type] = p.value
  }
  // Tagesversatz: deutsches Kalenderdatum vs. Event-Datum
  const berlinDateKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(instant) // YYYY-MM-DD
  const dayOffset = Math.round(
    (Date.parse(berlinDateKey + 'T00:00:00Z') - Date.parse(ev.date + 'T00:00:00Z')) / 86400000
  )
  return {
    time: `${map.hour}:${map.minute}`,
    dayOffset,
    weekday: map.weekday,
    dateLabel: `${map.day}.${map.month}.`,
  }
}

// Lokale Startzeit am Veranstaltungsort, z.B. "20:00".
export function localStartTime(ev: CalendarEvent): string {
  return (ev.localTime ?? DEFAULT_LOCAL_TIME)
}
