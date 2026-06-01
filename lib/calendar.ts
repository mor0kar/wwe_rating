// lib/calendar.ts
// Einzige Quelle für kommende WWE-Termine.
// Datenstand: offizielle WWE-Ticketseite (Venue + lokale Startzeit exakt), manuell gepflegt.
// Nur relevante Show-Typen: RAW, SmackDown, PLE, SNM — keine House-/Live-Tour-Shows,
// kein NXT/EVOLVE/LFG/AAA.
// Später austauschbar gegen eine API, ohne dass die UI angefasst werden muss —
// solange getUpcomingEvents() dieselbe Struktur (CalendarEvent[]) zurückgibt.

export type ShowType = 'RAW' | 'SmackDown' | 'PLE' | 'SNM'

export type CalendarEvent = {
  date: string        // offizielles lokales Event-Datum, YYYY-MM-DD
  type: ShowType
  title?: string
  venue?: string      // Arena (falls bekannt)
  city: string
  tz: string          // IANA-Zeitzone des Veranstaltungsorts
  localTime?: string  // lokale Startzeit HH:mm vor Ort (Default: 20:00)
  taped?: boolean     // Folge wird an diesem Abend aufgezeichnet, läuft erst später (Spoiler-Gefahr!)
  airsOn?: string     // YYYY-MM-DD der TV-Ausstrahlung (nur relevant wenn taped)
}

// Standard-Annahme, falls keine lokale Startzeit hinterlegt ist.
const DEFAULT_LOCAL_TIME = '20:00'

const EVENTS: CalendarEvent[] = [
  // Mai (bereits gelaufen)
  { date: '2026-05-29', type: 'SmackDown', venue: 'Olimpic Arena', city: 'Badalona, Spain', tz: 'Europe/Madrid' },
  { date: '2026-05-31', type: 'PLE', title: 'Clash in Italy', venue: 'Inalpi Arena', city: 'Turin, Italy', tz: 'Europe/Rome' },

  // Juni
  { date: '2026-06-01', type: 'RAW', venue: 'Inalpi Arena', city: 'Turin, Italy', tz: 'Europe/Rome', localTime: '19:30' },
  { date: '2026-06-05', type: 'SmackDown', venue: 'Unipol Arena', city: 'Bologna, Italy', tz: 'Europe/Rome', localTime: '19:30' },
  { date: '2026-06-08', type: 'RAW', venue: 'Accor Arena', city: 'Paris, France', tz: 'Europe/Paris', localTime: '19:30' },
  { date: '2026-06-12', type: 'SmackDown', venue: 'Amica Mutual Pavilion', city: 'Providence, RI', tz: 'America/New_York', localTime: '19:30' },
  { date: '2026-06-15', type: 'RAW', venue: 'CFG Bank Arena', city: 'Baltimore, MD', tz: 'America/New_York', localTime: '19:30' },
  { date: '2026-06-19', type: 'SmackDown', venue: 'T-Mobile Center', city: 'Kansas City, MO', tz: 'America/Chicago', localTime: '18:30' },
  { date: '2026-06-22', type: 'RAW', venue: 'The O2', city: 'London, UK', tz: 'Europe/London', localTime: '18:30' },
  // Europa-Tour: SmackDown wird Dienstag in London aufgezeichnet, läuft Fr 26.06.
  { date: '2026-06-23', type: 'SmackDown', venue: 'The O2', city: 'London, UK', tz: 'Europe/London', localTime: '18:00', taped: true, airsOn: '2026-06-26' },
  { date: '2026-06-27', type: 'PLE', title: 'Night of Champions', venue: 'Kingdom Arena', city: 'Riyadh, Saudi Arabia', tz: 'Asia/Riyadh', localTime: '19:00' },
  // Doubleheader: RAW läuft live, SmackDown wird im Anschluss aufgezeichnet und läuft Fr 03.07.
  { date: '2026-06-29', type: 'RAW', venue: 'Jim Whelan Boardwalk Hall', city: 'Atlantic City, NJ', tz: 'America/New_York', localTime: '17:30' },
  { date: '2026-06-29', type: 'SmackDown', venue: 'Jim Whelan Boardwalk Hall', city: 'Atlantic City, NJ', tz: 'America/New_York', localTime: '17:30', taped: true, airsOn: '2026-07-03' },

  // Juli
  { date: '2026-07-06', type: 'RAW', venue: 'Allstate Arena', city: 'Chicago, IL', tz: 'America/Chicago', localTime: '18:30' },
  { date: '2026-07-10', type: 'SmackDown', venue: 'Paycom Center', city: 'Oklahoma City, OK', tz: 'America/Chicago', localTime: '18:30' },
  { date: '2026-07-13', type: 'RAW', venue: 'American Airlines Center', city: 'Dallas, TX', tz: 'America/Chicago', localTime: '18:30' },
  { date: '2026-07-17', type: 'SmackDown', venue: 'MVP Arena', city: 'Albany, NY', tz: 'America/New_York', localTime: '19:30' },
  { date: '2026-07-18', type: 'SNM', title: "Saturday Night's Main Event", venue: 'Madison Square Garden', city: 'New York, NY', tz: 'America/New_York', localTime: '19:30' },
  { date: '2026-07-20', type: 'RAW', venue: 'Little Caesars Arena', city: 'Detroit, MI', tz: 'America/Detroit', localTime: '19:30' },
  { date: '2026-07-24', type: 'SmackDown', venue: 'Oakland Arena', city: 'Oakland, CA', tz: 'America/Los_Angeles', localTime: '16:30' },
  { date: '2026-07-27', type: 'RAW', venue: 'Intuit Dome', city: 'Los Angeles, CA', tz: 'America/Los_Angeles', localTime: '16:30' },
  { date: '2026-07-31', type: 'SmackDown', venue: 'Resch Center', city: 'Green Bay, WI', tz: 'America/Chicago', localTime: '18:30' },

  // August
  { date: '2026-08-01', type: 'PLE', title: 'SummerSlam (Night One)', venue: 'U.S. Bank Stadium', city: 'Minneapolis, MN', tz: 'America/Chicago', localTime: '16:30' },
  { date: '2026-08-02', type: 'PLE', title: 'SummerSlam (Night Two)', venue: 'U.S. Bank Stadium', city: 'Minneapolis, MN', tz: 'America/Chicago', localTime: '16:30' },
  { date: '2026-08-03', type: 'RAW', venue: "Casey's Center", city: 'Des Moines, IA', tz: 'America/Chicago', localTime: '18:30' },
  { date: '2026-08-10', type: 'RAW', venue: 'Scope Arena', city: 'Norfolk, VA', tz: 'America/New_York', localTime: '19:30' },
  { date: '2026-08-17', type: 'RAW', venue: 'KeyBank Center', city: 'Buffalo, NY', tz: 'America/New_York', localTime: '19:30' },
  { date: '2026-08-21', type: 'SmackDown', venue: 'Scotiabank Arena', city: 'Toronto, Canada', tz: 'America/Toronto', localTime: '19:30' },
  { date: '2026-08-24', type: 'RAW', venue: 'Canadian Tire Centre', city: 'Ottawa, Canada', tz: 'America/Toronto', localTime: '19:30' },
  { date: '2026-08-28', type: 'SmackDown', venue: 'Rocket Arena', city: 'Cleveland, OH', tz: 'America/New_York', localTime: '19:30' },
  { date: '2026-08-31', type: 'RAW', venue: 'Spectrum Center', city: 'Charlotte, NC', tz: 'America/New_York', localTime: '19:30' },

  // September
  { date: '2026-09-04', type: 'SmackDown', venue: 'Heritage Bank Center', city: 'Cincinnati, OH', tz: 'America/New_York', localTime: '19:30' },
  { date: '2026-09-06', type: 'PLE', title: 'Money in the Bank', venue: 'Smoothie King Center', city: 'New Orleans, LA', tz: 'America/Chicago', localTime: '19:00' },
  { date: '2026-09-07', type: 'RAW', venue: 'Legacy Arena', city: 'Birmingham, AL', tz: 'America/Chicago', localTime: '18:30' },
]

export function getUpcomingEvents(): CalendarEvent[] {
  return EVENTS
}

// Datum, an dem die Liste zuletzt aktualisiert wurde (bei jeder Pflege anpassen).
export const CALENDAR_LAST_UPDATED = '2026-06-01'

// Erinnerung auslösen, wenn weniger als so viele Tage Vorlauf bleiben …
const REFRESH_RUNWAY_DAYS = 28
// … oder die Liste seit so vielen Tagen nicht mehr gepflegt wurde.
const REFRESH_MAX_AGE_DAYS = 56

function dayDiff(aISO: string, bISO: string): number {
  return Math.round((Date.parse(aISO + 'T00:00:00Z') - Date.parse(bISO + 'T00:00:00Z')) / 86400000)
}

// Status für die Kalender-Erinnerung (rein, läuft client- wie serverseitig).
export function calendarStatus(now: Date = new Date()): {
  lastEventDate: string
  daysUntilLastEvent: number
  daysSinceUpdate: number
  needsRefresh: boolean
} {
  const todayISO = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(now)
  const lastEventDate = EVENTS.reduce((max, e) => (e.date > max ? e.date : max), EVENTS[0].date)
  const daysUntilLastEvent = dayDiff(lastEventDate, todayISO)
  const daysSinceUpdate = dayDiff(todayISO, CALENDAR_LAST_UPDATED)
  const needsRefresh = daysUntilLastEvent <= REFRESH_RUNWAY_DAYS || daysSinceUpdate >= REFRESH_MAX_AGE_DAYS
  return { lastEventDate, daysUntilLastEvent, daysSinceUpdate, needsRefresh }
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

// Ausstrahlungs-Label für aufgezeichnete Folgen, z.B. "Fr, 03.07.".
export function airsOnLabel(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  })
}
