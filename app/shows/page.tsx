'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getShowLogo, BADGE, BORDER_ACCENT, TINT, SHOW_TYPES, SHOW_FILTERS } from '@/lib/showStyle'
import { fmt, scoreColor, avgScore } from '@/lib/score'
import { getUpcomingEvents, eventInstant, type CalendarEvent } from '@/lib/calendar'
import ScoreRing from '@/app/components/ScoreRing'
import CalendarReminder from '@/app/components/CalendarReminder'
import { useIdentity } from '@/lib/identity'

type Show = {
  id: number
  type: string
  date: string
  title: string
  comment?: string | null
  ratings: Record<string, number>
  notes: Record<string, string | null>
}


// --- Inline-Edit-Card --------------------------------------------------

function EditCard({
  show,
  onSave,
  onCancel,
}: {
  show: Show
  onSave: (updated: Omit<Show, 'id'>) => Promise<void>
  onCancel: () => void
}) {
  const [type, setType] = useState(show.type)
  const [date, setDate] = useState(show.date)
  const [title, setTitle] = useState(show.title)
  const [comment, setComment] = useState(show.comment ?? '')
  const [baseRatings, setBaseRatings] = useState<Record<string, number>>(() => {
    return { ...show.ratings }
  })
  const [danhausen, setDanhausen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    Object.keys(show.ratings).forEach(p => {
      init[p] = !!(show.notes?.[p])
    })
    return init
  })
  const [bonuses, setBonuses] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    Object.keys(show.ratings).forEach(p => {
      init[p] = 0
    })
    return init
  })
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    Object.keys(show.ratings).forEach(p => {
      init[p] = show.notes?.[p] ?? ''
    })
    return init
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const effectiveRatings: Record<string, number> = {}
    const effectiveNotes: Record<string, string> = {}
    Object.keys(baseRatings).forEach(p => {
      const base = baseRatings[p] ?? 0
      const bonus = danhausen[p] ? (bonuses[p] ?? 0) : 0
      effectiveRatings[p] = base + bonus
      if (danhausen[p] && notes[p]) {
        effectiveNotes[p] = notes[p]
      }
    })
    await onSave({ type, date, title, comment, ratings: effectiveRatings, notes: effectiveNotes })
    setSaving(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-4">
      {/* Typ-Auswahl */}
      <div>
        <label className="text-xs text-zinc-500 mb-1.5 block">Show-Typ</label>
        <div className="flex gap-2 flex-wrap">
          {SHOW_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                type === t
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                  : 'border-zinc-700 text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Datum */}
      <div>
        <label className="text-xs text-zinc-500 mb-1.5 block">Datum</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
        />
      </div>

      {/* Titel */}
      <div>
        <label className="text-xs text-zinc-500 mb-1.5 block">Titel</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="optional"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      {/* Kommentar / Spitzname */}
      <div>
        <label className="text-xs text-zinc-500 mb-1.5 block">Kommentar</label>
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder='z.B. "Die Stuhl-Match-Folge"'
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      {/* Ratings */}
      <div>
        <label className="text-xs text-zinc-500 mb-2 block">Bewertungen</label>
        <div className="space-y-4">
          {Object.keys(baseRatings).map(p => {
            const base = baseRatings[p] ?? 0
            const bonus = danhausen[p] ? (bonuses[p] ?? 0) : 0
            const total = base + bonus
            return (
              <div key={p} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-100">{p}</span>
                  <span className={`text-base font-semibold ${
                    danhausen[p] ? 'text-purple-400 font-bold' : scoreColor(total)
                  }`}>
                    {danhausen[p] ? `⚡${fmt(total)}` : fmt(total)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={Math.min(base, 10)}
                    onChange={e => setBaseRatings(r => ({ ...r, [p]: parseFloat(e.target.value) }))}
                    className="flex-1 accent-zinc-100"
                  />
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={Math.min(base, 10)}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      if (!isNaN(v)) setBaseRatings(r => ({ ...r, [p]: Math.min(10, Math.max(0, v)) }))
                    }}
                    className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-zinc-50 outline-none focus:border-zinc-500 text-center"
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
                  <span>0</span><span>5</span><span>10</span>
                </div>

                {/* DANHAUSEN-Toggle */}
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={danhausen[p] ?? false}
                    onChange={e => setDanhausen(d => ({ ...d, [p]: e.target.checked }))}
                    className="accent-purple-400 w-4 h-4"
                  />
                  <span className="text-xs text-zinc-400">⚡ DANHAUSEN-Moment</span>
                </label>

                {danhausen[p] && (
                  <div className="space-y-1.5 pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">Bonus:</span>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={bonuses[p] ?? 0}
                        onChange={e => setBonuses(b => ({ ...b, [p]: parseFloat(e.target.value) || 0 }))}
                        className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-50 outline-none focus:border-purple-500 text-center"
                      />
                    </div>
                    <input
                      type="text"
                      value={notes[p] ?? ''}
                      onChange={e => setNotes(n => ({ ...n, [p]: e.target.value }))}
                      placeholder='Begründung (z.B. "Holy shit"-Moment)'
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-50 outline-none focus:border-purple-500 placeholder:text-zinc-600"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 border border-zinc-700 text-zinc-400 rounded-xl py-2 text-sm"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#DC0000] hover:bg-red-700 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}

// --- Show-Card ----------------------------------------------------------

function ShowCard({
  show,
  onUpdated,
  onDeleted,
}: {
  show: Show
  onUpdated: (updated: Show) => void
  onDeleted: (id: number) => void
}) {
  const router = useRouter()
  const { me, hideUntilRated } = useIdentity()
  const [mode, setMode] = useState<'view' | 'edit' | 'confirmDelete'>('view')
  const [deleting, setDeleting] = useState(false)
  const [revealed, setRevealed] = useState(false)

  // Spoiler verstecken, wenn: Toggle an + ich kenne mich + ich habe noch nicht bewertet
  const myScore = me ? show.ratings[me] : undefined
  const spoilerActive = hideUntilRated && !!me && myScore === undefined && !revealed

  const a = avgScore(Object.values(show.ratings))
  const dateStr = new Date(show.date + 'T12:00:00').toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const persons = Object.keys(show.ratings)

  async function handleSave(updated: Omit<Show, 'id'>) {
    await fetch(`/api/shows/${show.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    onUpdated({ id: show.id, ...updated })
    setMode('view')
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/shows/${show.id}`, { method: 'DELETE' })
    onDeleted(show.id)
  }

  if (mode === 'edit') {
    return (
      <EditCard
        show={show}
        onSave={handleSave}
        onCancel={() => setMode('view')}
      />
    )
  }

  const accentBorder = BORDER_ACCENT[show.type] || 'border-l-zinc-700'

  return (
    <div
      className={`group relative overflow-hidden bg-zinc-900 border border-zinc-800 border-l-4 ${accentBorder} rounded-2xl p-4 cursor-pointer transition-all hover:border-zinc-700 active:scale-[0.98] animate-fade-in`}
      onClick={() => router.push(`/shows/${show.id}`)}
    >
      {/* Typ-getönter Verlauf */}
      <div className={`absolute inset-0 pointer-events-none ${TINT[show.type] || ''}`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              {getShowLogo(show.type, show.title) ? (
                <img src={getShowLogo(show.type, show.title)!} alt={show.title || show.type} className="h-7 object-contain shrink-0" loading="lazy" />
              ) : (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ${BADGE[show.type] || 'bg-zinc-800 text-zinc-300'}`}>
                  {show.type}
                </span>
              )}
            </div>
            <span className="block font-heading text-base font-semibold text-zinc-50 truncate uppercase tracking-wide">
              {show.title || show.type}
            </span>
            {show.comment && show.comment.trim() !== '' && (
              <p className="text-xs text-zinc-300 italic mt-0.5 truncate" title={show.comment}>
                &ldquo;{show.comment}&rdquo;
              </p>
            )}
            <p className="text-xs text-zinc-500 mt-0.5">{dateStr}</p>
          </div>
          <div className="flex items-start gap-1 shrink-0">
            {a !== null && (
              spoilerActive ? (
                <div className="w-[52px] h-[52px] rounded-full bg-zinc-800/60 border border-dashed border-zinc-700 flex items-center justify-center">
                  <span className="text-zinc-500 text-lg">👁</span>
                </div>
              ) : (
                <ScoreRing value={a} size={52} />
              )
            )}
            {/* Edit-Button — stopPropagation verhindert Navigation zur Detail-Seite.
                Im Spoiler-Modus ausgeblendet, weil die Inline-EditCard alle Ratings zeigt.
                User soll dann zur Detailseite und dort den RatingEditor (Spoiler-fähig) nutzen. */}
            {!spoilerActive && (
              <button
                onClick={e => { e.stopPropagation(); setMode('edit') }}
                className="text-zinc-600 hover:text-zinc-300 p-1 transition-colors"
                aria-label="Show bearbeiten"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Ratings */}
        {spoilerActive ? (
          <div
            className="flex items-center justify-between gap-2 rounded-xl bg-zinc-800/40 border border-dashed border-zinc-700 px-3 py-2"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs text-zinc-400">
              Bewertungen versteckt — du hast noch nicht bewertet
            </p>
            <button
              onClick={() => setRevealed(true)}
              className="text-[10px] uppercase tracking-wider font-bold text-zinc-300 hover:text-zinc-100 px-2 py-1 rounded transition-colors"
            >
              Aufdecken
            </button>
          </div>
        ) : (
        <div className="flex flex-wrap gap-1.5">
          {persons.map(p => {
            const note = show.notes?.[p]
            const isDanhausen = !!(note && note.trim() !== '')
            return (
              <div
                key={p}
                className={`flex items-center gap-1.5 rounded-full pl-2.5 pr-2 py-1 transition-colors ${
                  isDanhausen
                    ? 'bg-purple-950/60 ring-1 ring-purple-500/40 cursor-help'
                    : 'bg-zinc-800/80'
                }`}
                title={isDanhausen ? `⚡ ${note}` : undefined}
                onClick={isDanhausen ? e => e.stopPropagation() : undefined}
              >
                <span className={`text-xs ${isDanhausen ? 'text-purple-300' : 'text-zinc-400'}`}>{p}</span>
                <span className={`text-sm font-heading font-semibold tabular-nums ${
                  isDanhausen ? 'text-purple-400' : scoreColor(show.ratings[p])
                }`}>
                  {isDanhausen ? `⚡${fmt(show.ratings[p])}` : fmt(show.ratings[p])}
                </span>
              </div>
            )
          })}
        </div>
        )}
      </div>

      {/* Löschen-Toggle */}
      {mode === 'confirmDelete' ? (
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
          <p className="text-sm text-zinc-400">Show wirklich löschen?</p>
          <div className="flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); setMode('view') }}
              className="text-xs px-3 py-1.5 border border-zinc-700 rounded-lg text-zinc-500"
            >
              Nein
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleDelete() }}
              disabled={deleting}
              className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {deleting ? 'Löschen...' : 'Ja, löschen'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={e => { e.stopPropagation(); setMode('confirmDelete') }}
            className="text-xs text-red-400"
          >
            Löschen
          </button>
        </div>
      )}
    </div>
  )
}

// --- Main Page ----------------------------------------------------------

export default function ShowsPage() {
  const router = useRouter()
  const [shows, setShows] = useState<Show[]>([])
  const [filter, setFilter] = useState('Alle')
  const [loading, setLoading] = useState(true)

  // Schlüssel (Typ|Datum) aller bereits angelegten Shows — filterunabhängig,
  // damit der "Noch zu bewerten"-Überblick stimmt.
  const [existingKeys, setExistingKeys] = useState<Set<string>>(new Set())

  function loadShows(f: string) {
    setLoading(true)
    const type = f === 'Alle' ? 'all' : f
    fetch(`/api/shows?type=${type}`)
      .then(r => r.json())
      .then((data: Show[]) => { setShows(data); setLoading(false) })
  }

  useEffect(() => { loadShows(filter) }, [filter])

  // Alle Shows einmalig laden, um offene (gelaufene, nicht angelegte) Events zu ermitteln
  useEffect(() => {
    fetch('/api/shows?type=all')
      .then(r => r.json())
      .then((data: Show[]) => setExistingKeys(new Set(data.map(s => `${s.type}|${s.date}`))))
      .catch(() => {})
  }, [])

  // Gelaufene Kalender-Events ohne angelegte Show → "noch zu bewerten"
  const now = Date.now()
  const pending = getUpcomingEvents().filter(
    ev => eventInstant(ev).getTime() < now && !existingKeys.has(`${ev.type}|${ev.date}`)
  )

  function rateEvent(ev: CalendarEvent) {
    const params = new URLSearchParams({ type: ev.type, date: ev.date, title: ev.title ?? '' })
    router.push(`/shows/add?${params.toString()}`)
  }

  function handleUpdated(updated: Show) {
    setShows(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  function handleDeleted(id: number) {
    setShows(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden mb-8">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/header.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/75 to-zinc-950" />
        <div className="absolute inset-0 texture-grain opacity-[0.07] mix-blend-overlay pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-8 lg:pt-16 lg:pb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Show-Bewertungen</p>
            <h1 className="font-heading text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white drop-shadow-lg leading-[0.95]">Squared Circle Ratings</h1>
          </div>
          <p className="text-zinc-500 text-sm shrink-0">{shows.length} Shows bewertet</p>
        </div>
      </div>

      {/* Erinnerung, den Kalender zu aktualisieren (wenn er zur Neige geht) */}
      <CalendarReminder />

      {/* Noch zu bewerten — gelaufene Events ohne angelegte Show */}
      {pending.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="bg-zinc-900 border border-red-900/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-100">Noch zu bewerten</h2>
              <span className="text-xs text-zinc-500">({pending.length})</span>
            </div>
            <div className="space-y-2.5">
              {pending.map((ev, i) => {
                const logo = getShowLogo(ev.type, ev.title)
                const dateStr = new Date(ev.date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
                return (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {logo ? (
                        <img src={logo} alt={ev.title || ev.type} className="h-4 object-contain shrink-0" loading="lazy" />
                      ) : (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${BADGE[ev.type] || 'bg-zinc-800 text-zinc-300'}`}>
                          {ev.type}
                        </span>
                      )}
                      <span className="text-sm text-zinc-200 truncate">{ev.title || ev.type}</span>
                      <span className="text-xs text-zinc-600 shrink-0">{dateStr}</span>
                    </div>
                    <button
                      onClick={() => rateEvent(ev)}
                      className="shrink-0 text-xs bg-[#DC0000] hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide transition-colors"
                    >
                      Bewerten
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter-Chips + Show-Liste */}
      <div className="max-w-6xl mx-auto px-4 pb-24 lg:pb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-none">
          {SHOW_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                  : 'border-zinc-700 text-zinc-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-6 w-20 rounded-md" />
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                  <div className="skeleton h-[52px] w-[52px] rounded-full" />
                </div>
                <div className="flex gap-1.5">
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {shows.map(show => (
              <ShowCard
                key={show.id}
                show={show}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
