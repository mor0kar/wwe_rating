'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getUpcomingEvents,
  germanWatchTime,
  localStartTime,
  airsOnLabel,
  missingShowWeeks,
  type CalendarEvent,
} from '@/lib/calendar'
import { BORDER_ACCENT, SHOW_TYPES } from '@/lib/showStyle'
import ShowLogo from '@/app/components/ShowLogo'
import { useCustomEvents, addCustomEvent, removeCustomEvent, type CustomEvent } from '@/lib/customEvents'

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

function isCustom(ev: CalendarEvent): ev is CustomEvent {
  return (ev as CustomEvent).custom === true
}

type ExistingShow = { id: number; hasRatings: boolean }

// Browser-Default-Zeitzone (z.B. Europe/Berlin). Reicht für selbst eingetragene
// Events — wer Custom-Events anlegt, hat meistens die deutsche Zeit im Kopf.
function browserTz(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin' }
  catch { return 'Europe/Berlin' }
}

function CustomEventForm({ onDone }: { onDone: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState<'RAW' | 'SmackDown' | 'PLE' | 'SNM'>('RAW')
  const [title, setTitle] = useState('')
  const [venue, setVenue] = useState('')
  const [city, setCity] = useState('')
  const [localTime, setLocalTime] = useState('20:00')
  const [tz, setTz] = useState(browserTz())
  const [error, setError] = useState('')

  function handleSave() {
    if (!city.trim()) { setError('Stadt ist Pflicht.'); return }
    addCustomEvent({
      date,
      type,
      title: title.trim() || undefined,
      venue: venue.trim() || undefined,
      city: city.trim(),
      tz,
      localTime,
    })
    onDone()
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-zinc-100">Eigenes Event anlegen</h3>
        <button onClick={onDone} className="text-xs text-zinc-500 hover:text-zinc-300 min-h-[44px] min-w-[44px]">Abbrechen</button>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Typ</label>
        <div className="flex gap-2 flex-wrap">
          {SHOW_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-xs px-3 py-2 min-h-[44px] rounded-xl border transition-colors ${
                type === t ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'border-zinc-700 text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Datum</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Lokale Startzeit</label>
          <input
            type="time"
            value={localTime}
            onChange={e => setLocalTime(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Titel (optional, z.B. &quot;SummerSlam&quot;)</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="optional"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Venue (optional)</label>
        <input
          type="text"
          value={venue}
          onChange={e => setVenue(e.target.value)}
          placeholder="z.B. Madison Square Garden"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Stadt (Pflicht)</label>
        <input
          type="text"
          value={city}
          onChange={e => { setCity(e.target.value); setError('') }}
          placeholder="z.B. New York, NY"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Zeitzone (IANA)</label>
        <input
          type="text"
          value={tz}
          onChange={e => setTz(e.target.value)}
          placeholder="Europe/Berlin, America/New_York, ..."
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-50 font-mono outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
        <p className="text-[10px] text-zinc-600 mt-1">
          Standard ist deine Browser-Zeitzone. Für US-Shows z.B. America/New_York.
        </p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onDone}
          className="flex-1 border border-zinc-700 text-zinc-400 rounded-xl py-3 text-sm min-h-[44px]"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-[#DC0000] hover:bg-red-700 text-white rounded-xl py-3 text-sm font-medium min-h-[44px] transition-colors"
        >
          Speichern
        </button>
      </div>
    </div>
  )
}

export default function UpcomingPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const { events: customEvents } = useCustomEvents()
  const [showForm, setShowForm] = useState(false)
  // Statische + benutzerdefinierte Events nach Datum sortiert
  const events = [...getUpcomingEvents(), ...customEvents].sort((a, b) => a.date.localeCompare(b.date))

  // Kommende (heute & später) nach Monat gruppieren; vergangene separat (neueste zuerst)
  const upcoming = events.filter(ev => !isPast(ev.date))
  const past = events.filter(ev => isPast(ev.date)).reverse()
  const groups = groupByMonth(upcoming)

  // Bereits angelegte Shows laden, um Doppel-Anlage zu verhindern (Abgleich Typ+Datum)
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

  const gaps = missingShowWeeks()
  const fmtDay = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })

  // Eine Event-Karte — geteilt von "kommend" und "vergangen"
  function renderEvent(ev: CalendarEvent, key: React.Key) {
    const accent = BORDER_ACCENT[ev.type] || 'border-l-zinc-700'
    const isToday = ev.date === today
    const de = germanWatchTime(ev)
    const local = localStartTime(ev)
    const existing = existingShows[`${ev.type}|${ev.date}`]
    return (
      <div
        key={key}
        className={`bg-zinc-900 border border-zinc-800 border-l-4 ${accent} rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors hover:border-zinc-700 ${ev.taped ? 'ring-1 ring-amber-500/40' : ''} ${isToday ? 'ring-1 ring-red-600/50' : ''}`}
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
              <ShowLogo type={ev.type} title={ev.title} heightClass="h-4" badgeClass="text-[10px] font-semibold px-2 py-0.5" />
              {ev.title && ev.title !== ev.type && (
                <span className="text-sm font-semibold text-zinc-100 truncate">{ev.title}</span>
              )}
              {ev.taped && (
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  📼 Tape
                </span>
              )}
              {isCustom(ev) && (
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-700/40 text-zinc-300 border border-zinc-600">
                  ✏️ Custom
                </span>
              )}
            </div>
            {ev.venue && <p className="text-xs text-zinc-500 truncate">{ev.venue}</p>}
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
              <span className={`font-medium ${!ev.taped && de.liveFriendly ? 'text-green-400' : 'text-red-400'}`}>
                🇩🇪 {de.time} Uhr
                {de.dayOffset !== 0 && (
                  <span className="text-zinc-500 font-normal"> ({de.weekday}, {de.dateLabel})</span>
                )}
              </span>
              {ev.taped ? (
                <span className="text-amber-400/80">(Aufzeichnung)</span>
              ) : de.liveFriendly ? (
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-500/15 text-green-300 border border-green-500/30">
                  📺 Live machbar
                </span>
              ) : (
                <span className="text-zinc-600">🌙 lieber am Folgetag</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {/* Existiert schon eine Show? → "Bewertet ✓" zur Detailseite, sonst "Bewerten" */}
          {existing ? (
            <button
              onClick={() => router.push(`/shows/${existing.id}`)}
              className="flex items-center gap-1.5 text-xs bg-green-950 hover:bg-green-900 text-green-400 border border-green-900 px-3 py-2 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              {existing.hasRatings ? 'Bewertet' : 'Angelegt'}
            </button>
          ) : (
            <button
              onClick={() => handleAdd(ev)}
              className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Bewerten
            </button>
          )}
          {isCustom(ev) && (
            <button
              onClick={() => {
                if (confirm(`"${ev.title || ev.type}" am ${ev.date} entfernen?`)) {
                  removeCustomEvent(ev.id)
                }
              }}
              className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
            >
              Entfernen
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 texture-grain opacity-[0.06] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,0,0,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Kommende Shows</p>
            <h1 className="text-4xl font-bold uppercase tracking-tight text-white">Kalender</h1>
            <p className="text-zinc-500 text-xs mt-1">Ortszeit &amp; deutsche Live-Zeit (🇩🇪) automatisch umgerechnet</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="shrink-0 flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-2 rounded-xl transition-colors min-h-[44px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Event hinzufügen
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <CustomEventForm onDone={() => setShowForm(false)} />
        </div>
      )}

      {/* Hinweis: Wochen, in denen RAW oder SmackDown (noch) fehlt */}
      {gaps.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4">
            <p className="text-sm font-semibold text-amber-200 flex items-center gap-2">
              <span>⚠️</span> Fehlende Shows
            </p>
            <p className="text-xs text-amber-200/80 mt-0.5">
              In diesen Wochen ist noch keine Show gebucht (oder die Location steht noch nicht fest):
            </p>
            <ul className="mt-2 space-y-1">
              {gaps.map(g => (
                <li key={g.weekStart} className="text-xs text-amber-100">
                  <span className="text-amber-300/70">{fmtDay(g.weekStart)}–{fmtDay(g.weekEnd)}:</span>{' '}
                  {g.missing.join(' & ')} fehlt
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-8">
        {/* Kommende Shows nach Monat */}
        {Object.entries(groups).map(([monthKey, monthEvents]) => (
          <div key={monthKey}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              {monthLabel(monthKey)}
            </h2>
            <div className="space-y-2">
              {monthEvents.map((ev, i) => renderEvent(ev, `${monthKey}-${i}`))}
            </div>
          </div>
        ))}

        {Object.keys(groups).length === 0 && (
          <p className="text-center text-zinc-600 text-sm py-8">Keine kommenden Shows im Kalender.</p>
        )}

        {/* Vergangene Shows — eingeklappt, dezent abgegrenzt */}
        {past.length > 0 && (
          <details className="group border-t border-zinc-800/80 pt-4">
            <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors py-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 transition-transform group-open:rotate-90">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
              Vergangene Shows
              <span className="text-zinc-600">({past.length})</span>
            </summary>
            <div className="space-y-2 mt-3 opacity-60">
              {past.map((ev, i) => renderEvent(ev, `past-${i}`))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
