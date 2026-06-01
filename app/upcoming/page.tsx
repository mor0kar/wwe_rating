'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getUpcomingEvents,
  germanWatchTime,
  localStartTime,
  airsOnLabel,
  type CalendarEvent,
} from '@/lib/calendar'
import { getShowLogo, BADGE, BORDER_ACCENT } from '@/lib/showStyle'

const MONTH_NAMES: Record<number, string> = {
  1: 'Januar', 2: 'Februar', 3: 'März', 4: 'April',
  5: 'Mai', 6: 'Juni', 7: 'Juli', 8: 'August',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Dezember',
}

function groupByMonth(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const groups: Record<string, CalendarEvent[]> = {}
  for (const ev of events) {
    const [year, month] = ev.date.split('-')
    const key = `${year}-${month}`
    if (!groups[key]) groups[key] = []
    groups[key].push(ev)
  }
  return groups
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

type ExistingShow = { id: number; hasRatings: boolean }

export default function UpcomingPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const events = getUpcomingEvents()
  const groups = groupByMonth(events)

  // Bereits angelegte Shows laden, um Doppel-Anlage zu verhindern.
  // Abgleich über Typ + Datum.
  const [existingShows, setExistingShows] = useState<Record<string, ExistingShow>>({})

  useEffect(() => {
    fetch('/api/shows?type=all')
      .then(r => r.json())
      .then((data: { id: number; type: string; date: string; ratings?: Record<string, number> }[]) => {
        const map: Record<string, ExistingShow> = {}
        for (const s of data) {
          map[`${s.type}|${s.date}`] = {
            id: s.id,
            hasRatings: Object.keys(s.ratings ?? {}).length > 0,
          }
        }
        setExistingShows(map)
      })
      .catch(() => {})
  }, [])

  function handleAdd(ev: CalendarEvent) {
    const params = new URLSearchParams({
      type: ev.type,
      date: ev.date,
      title: ev.title ?? '',
    })
    router.push(`/shows/add?${params.toString()}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 texture-grain opacity-[0.06] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,0,0,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6">
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Kommende Shows</p>
          <h1 className="text-4xl font-bold uppercase tracking-tight text-white">Kalender</h1>
          <p className="text-zinc-500 text-xs mt-1">Ortszeit &amp; deutsche Live-Zeit (🇩🇪) automatisch umgerechnet</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-8">
        {Object.entries(groups).map(([monthKey, monthEvents]) => (
          <div key={monthKey}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              {monthLabel(monthKey)}
            </h2>
            <div className="space-y-2">
              {monthEvents.map((ev, i) => {
                const past = isPast(ev.date)
                const accent = BORDER_ACCENT[ev.type] || 'border-l-zinc-700'
                const isToday = ev.date === today
                const de = germanWatchTime(ev)
                const local = localStartTime(ev)
                const existing = existingShows[`${ev.type}|${ev.date}`]
                return (
                  <div
                    key={i}
                    className={`bg-zinc-900 border border-zinc-800 border-l-4 ${accent} rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors hover:border-zinc-700 ${ev.taped ? 'ring-1 ring-amber-500/40' : ''} ${past && !existing ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Datum-Pill */}
                      <div className={`shrink-0 text-center min-w-[52px] ${isToday ? 'text-red-400' : 'text-zinc-400'}`}>
                        <p className="text-[10px] font-medium uppercase leading-none mb-0.5">
                          {new Date(ev.date + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short' })}
                        </p>
                        <p className="text-xl font-black leading-none">
                          {new Date(ev.date + 'T12:00:00').getDate().toString().padStart(2, '0')}
                        </p>
                        <p className="text-[10px] leading-none mt-0.5">
                          {new Date(ev.date + 'T12:00:00').toLocaleDateString('de-DE', { month: 'short' })}
                        </p>
                      </div>

                      {/* Show-Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {getShowLogo(ev.type, ev.title) ? (
                            <img src={getShowLogo(ev.type, ev.title)!} alt={ev.title || ev.type} className="h-4 object-contain shrink-0" loading="lazy" />
                          ) : (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${BADGE[ev.type] || 'bg-zinc-800 text-zinc-300'}`}>
                              {ev.type}
                            </span>
                          )}
                          {ev.title && ev.title !== ev.type && (
                            <span className="text-sm font-semibold text-zinc-100 truncate">{ev.title}</span>
                          )}
                          {ev.taped && (
                            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              📼 Tape
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{ev.venue}</p>
                        <p className="text-xs text-zinc-600 truncate">{ev.city}</p>

                        {/* Spoiler-Hinweis für aufgezeichnete Folgen */}
                        {ev.taped && ev.airsOn && (
                          <p className="text-[11px] text-amber-400 font-medium mt-1">
                            ⚠️ Vorab aufgezeichnet · Ausstrahlung {airsOnLabel(ev.airsOn)} — Spoiler-Gefahr
                          </p>
                        )}

                        {/* Zeiten: Ortszeit + deutsche (Aufnahme-)Zeit */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[11px] leading-none">
                          <span className="text-zinc-500">{local} Uhr Ortszeit</span>
                          <span className="text-zinc-700">·</span>
                          <span className="text-red-400 font-medium">
                            🇩🇪 {de.time} Uhr
                            {de.dayOffset !== 0 && (
                              <span className="text-zinc-500 font-normal"> ({de.weekday}, {de.dateLabel})</span>
                            )}
                          </span>
                          {ev.taped && <span className="text-amber-400/80">(Aufzeichnung)</span>}
                        </div>
                      </div>
                    </div>

                    {/* Existiert schon eine Show? → "Bewertet ✓" zur Detailseite,
                        sonst "Bewerten" (legt eine neue Show an) */}
                    {existing ? (
                      <button
                        onClick={() => router.push(`/shows/${existing.id}`)}
                        className="shrink-0 flex items-center gap-1.5 text-xs bg-green-950 hover:bg-green-900 text-green-400 border border-green-900 px-3 py-2 rounded-xl transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {existing.hasRatings ? 'Bewertet' : 'Angelegt'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdd(ev)}
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
