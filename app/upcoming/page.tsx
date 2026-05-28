'use client'
import { useRouter } from 'next/navigation'

type UpcomingShow = {
  date: string        // ISO YYYY-MM-DD
  type: 'RAW' | 'SmackDown' | 'PLE' | 'SNM'
  title?: string
  venue: string
  city: string
}

const UPCOMING: UpcomingShow[] = [
  { date: '2026-05-29', type: 'SmackDown', venue: 'Olimpic Arena', city: 'Barcelona, Spain' },
  { date: '2026-05-31', type: 'PLE', title: 'Clash in Italy', venue: 'Inalpi Arena', city: 'Turin, Italy' },
  { date: '2026-06-01', type: 'RAW', venue: 'Inalpi Arena', city: 'Turin, Italy' },
  { date: '2026-06-05', type: 'SmackDown', venue: 'Unipol Arena', city: 'Bologna, Italy' },
  { date: '2026-06-08', type: 'RAW', venue: 'Accor Arena', city: 'Paris, France' },
  { date: '2026-06-15', type: 'RAW', venue: 'CFG Bank Arena', city: 'Baltimore, MD' },
  { date: '2026-06-19', type: 'SmackDown', venue: 'T-Mobile Center', city: 'Kansas City, MO' },
  { date: '2026-06-22', type: 'RAW', venue: 'The O2', city: 'London, UK' },
  { date: '2026-06-29', type: 'RAW', title: 'RAW/SmackDown', venue: "Jim Whelan's Boardwalk Hall", city: 'Atlantic City, NJ' },
  { date: '2026-07-06', type: 'RAW', venue: 'Allstate Arena', city: 'Chicago, IL' },
  { date: '2026-07-10', type: 'SmackDown', venue: 'Paycom Center', city: 'Oklahoma City, OK' },
  { date: '2026-07-13', type: 'RAW', venue: 'American Airlines Arena', city: 'Dallas, TX' },
  { date: '2026-07-17', type: 'SmackDown', venue: 'MVP Arena', city: 'Albany, NY' },
  { date: '2026-07-18', type: 'SNM', title: "Saturday Night's Main Event", venue: 'Madison Square Garden', city: 'New York, NY' },
  { date: '2026-07-20', type: 'RAW', venue: 'Little Caesars Arena', city: 'Detroit, MI' },
  { date: '2026-07-24', type: 'SmackDown', venue: 'Oakland Arena', city: 'Oakland, CA' },
  { date: '2026-07-27', type: 'RAW', venue: 'Intuit Dome', city: 'Inglewood, CA' },
  { date: '2026-07-31', type: 'SmackDown', venue: 'Resch Center', city: 'Green Bay, WI' },
  { date: '2026-08-01', type: 'PLE', title: 'SummerSlam (Night One)', venue: 'US Bank Stadium', city: 'Minneapolis, MN' },
  { date: '2026-08-02', type: 'PLE', title: 'SummerSlam (Night Two)', venue: 'US Bank Stadium', city: 'Minneapolis, MN' },
  { date: '2026-08-03', type: 'RAW', venue: "Casey's Center", city: 'Des Moines, IA' },
  { date: '2026-08-10', type: 'RAW', venue: 'Scope Arena', city: 'Norfolk, VA' },
  { date: '2026-08-17', type: 'RAW', venue: 'KeyBank Arena', city: 'Buffalo, NY' },
  { date: '2026-08-28', type: 'SmackDown', venue: 'Rocket Mortgage FieldHouse', city: 'Cleveland, OH' },
  { date: '2026-08-31', type: 'RAW', venue: 'Spectrum Center', city: 'Charlotte, NC' },
  { date: '2026-09-04', type: 'SmackDown', venue: 'Heritage Bank Center', city: 'Cincinnati, OH' },
  { date: '2026-09-06', type: 'PLE', title: 'Money in the Bank', venue: 'Smoothie King Center', city: 'New Orleans, LA' },
  { date: '2026-09-07', type: 'RAW', venue: 'Legacy Center at BJCC', city: 'Birmingham, AL' },
]

const BADGE: Record<string, string> = {
  RAW: 'bg-red-950 text-red-400',
  SmackDown: 'bg-blue-950 text-blue-400',
  PLE: 'bg-purple-950 text-purple-400',
  SNM: 'bg-amber-950 text-amber-400',
}

const BORDER_ACCENT: Record<string, string> = {
  RAW: 'border-l-red-600',
  SmackDown: 'border-l-blue-600',
  PLE: 'border-l-purple-600',
  SNM: 'border-l-amber-500',
}

const LOGOS: Record<string, string> = {
  RAW: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/WWE_RAW_Logo_2025.svg/3840px-WWE_RAW_Logo_2025.svg.png',
  SmackDown: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/WWE_SmackDown_%282024%29_Logo.svg/960px-WWE_SmackDown_%282024%29_Logo.svg.png',
  SNM: 'https://www.wwe.com/f/styles/wwe_large/public/all/2024/12/SNME-presale-reg-logo--5b3c37e662fa172d6cc9b7c74d699987--fa61ee9da3b54c8c4a052c2799aa0f87.png',
}

const MONTH_NAMES: Record<number, string> = {
  1: 'Januar', 2: 'Februar', 3: 'März', 4: 'April',
  5: 'Mai', 6: 'Juni', 7: 'Juli', 8: 'August',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Dezember',
}

function groupByMonth(shows: UpcomingShow[]): Record<string, UpcomingShow[]> {
  const groups: Record<string, UpcomingShow[]> = {}
  for (const show of shows) {
    const [year, month] = show.date.split('-')
    const key = `${year}-${month}`
    if (!groups[key]) groups[key] = []
    groups[key].push(show)
  }
  return groups
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function monthLabel(key: string) {
  const [year, month] = key.split('-')
  return `${MONTH_NAMES[parseInt(month)]} ${year}`
}

function isPast(iso: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(iso + 'T12:00:00') < today
}

export default function UpcomingPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const groups = groupByMonth(UPCOMING)

  function handleAdd(show: UpcomingShow) {
    const params = new URLSearchParams({
      type: show.type,
      date: show.date,
      title: show.title ?? '',
    })
    router.push(`/shows/add?${params.toString()}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950" />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6">
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Kommende Shows</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Kalender</h1>
          <p className="text-zinc-500 text-xs mt-1">Quelle: ESPN — Stand 28. Mai 2026</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-8">
        {Object.entries(groups).map(([monthKey, shows]) => (
          <div key={monthKey}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              {monthLabel(monthKey)}
            </h2>
            <div className="space-y-2">
              {shows.map((show, i) => {
                const past = isPast(show.date)
                const accent = BORDER_ACCENT[show.type] || 'border-l-zinc-700'
                const isToday = show.date === today
                return (
                  <div
                    key={i}
                    className={`bg-zinc-900 border border-zinc-800 border-l-4 ${accent} rounded-2xl p-4 flex items-center justify-between gap-3 ${past ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Datum-Pill */}
                      <div className={`shrink-0 text-center min-w-[52px] ${isToday ? 'text-red-400' : 'text-zinc-400'}`}>
                        <p className="text-[10px] font-medium uppercase leading-none mb-0.5">
                          {new Date(show.date + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short' })}
                        </p>
                        <p className="text-xl font-black leading-none">
                          {new Date(show.date + 'T12:00:00').getDate().toString().padStart(2, '0')}
                        </p>
                        <p className="text-[10px] leading-none mt-0.5">
                          {new Date(show.date + 'T12:00:00').toLocaleDateString('de-DE', { month: 'short' })}
                        </p>
                      </div>

                      {/* Show-Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {LOGOS[show.type] ? (
                            <img src={LOGOS[show.type]} alt={show.type} className="h-4 object-contain shrink-0" loading="lazy" />
                          ) : (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${BADGE[show.type] || 'bg-zinc-800 text-zinc-300'}`}>
                              {show.type}
                            </span>
                          )}
                          {show.title && show.title !== show.type && (
                            <span className="text-sm font-semibold text-zinc-100 truncate">{show.title}</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{show.venue}</p>
                        <p className="text-xs text-zinc-600 truncate">{show.city}</p>
                      </div>
                    </div>

                    {/* Rating-Button (nur für nicht-vergangene Shows) */}
                    {!past && (
                      <button
                        onClick={() => handleAdd(show)}
                        className="shrink-0 flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Bewerten
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
