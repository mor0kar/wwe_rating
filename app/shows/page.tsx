'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Show = {
  id: number
  type: string
  date: string
  title: string
  ratings: Record<string, number>
  notes: Record<string, string | null>
}

const SHOW_TYPES = ['RAW', 'SmackDown', 'PLE', 'SNM']

const BADGE: Record<string, string> = {
  RAW: 'bg-red-950 text-red-400',
  SmackDown: 'bg-blue-950 text-blue-400',
  PLE: 'bg-purple-950 text-purple-400',
  SNM: 'bg-amber-950 text-amber-400',
  NXT: 'bg-green-950 text-green-400',
}

const LOGOS: Record<string, string> = {
  RAW: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/WWE_RAW_Logo_2025.svg/3840px-WWE_RAW_Logo_2025.svg.png',
  SmackDown: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/WWE_SmackDown_%282024%29_Logo.svg/960px-WWE_SmackDown_%282024%29_Logo.svg.png',
  NXT: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/WWE_NXT_2024_Logo.svg/3840px-WWE_NXT_2024_Logo.svg.png',
  SNM: 'https://www.wwe.com/f/styles/wwe_large/public/all/2024/12/SNME-presale-reg-logo--5b3c37e662fa172d6cc9b7c74d699987--fa61ee9da3b54c8c4a052c2799aa0f87.png',
}

function fmt(n: number): string {
  const s = parseFloat(n.toFixed(2)).toString()
  return s.includes('.') ? s : s + '.0'
}

// Akzent-Border-Farbe pro Show-Typ
const BORDER_ACCENT: Record<string, string> = {
  RAW: 'border-l-red-600',
  SmackDown: 'border-l-blue-600',
  PLE: 'border-l-purple-600',
  SNM: 'border-l-amber-500',
  NXT: 'border-l-green-600',
}

function scoreColor(s: number) {
  if (s > 10) return 'text-purple-400 font-bold'
  if (s >= 7) return 'text-green-400'
  if (s >= 4) return 'text-amber-500'
  return 'text-red-400'
}

function avg(ratings: Record<string, number>) {
  const vals = Object.values(ratings).filter(v => v != null)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

const FILTERS = ['Alle', 'RAW', 'SmackDown', 'PLE', 'SNM', 'NXT']

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
    await onSave({ type, date, title, ratings: effectiveRatings, notes: effectiveNotes })
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
                  <span className={`text-base font-semibold ${scoreColor(total)}`}>
                    {total > 10 ? `⚡${fmt(total)}` : fmt(total)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.01}
                  value={base}
                  onChange={e => setBaseRatings(r => ({ ...r, [p]: parseFloat(e.target.value) }))}
                  className="w-full accent-zinc-100"
                />
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
                        min={0.01}
                        max={5.0}
                        step={0.01}
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
  const [mode, setMode] = useState<'view' | 'edit' | 'confirmDelete'>('view')
  const [deleting, setDeleting] = useState(false)

  const a = avg(show.ratings)
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
      className={`bg-zinc-900 border border-zinc-800 border-l-4 ${accentBorder} rounded-2xl p-4 cursor-pointer active:bg-zinc-800 transition-colors`}
      onClick={() => router.push(`/shows/${show.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {LOGOS[show.type] ? (
              <img src={LOGOS[show.type]} alt={show.type} className="h-5 object-contain shrink-0" loading="lazy" />
            ) : (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ${BADGE[show.type] || 'bg-zinc-800 text-zinc-300'}`}>
                {show.type}
              </span>
            )}
            <span className="text-sm font-medium text-zinc-50 truncate">
              {show.title || show.type}
            </span>
          </div>
          <p className="text-xs text-zinc-600">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {a !== null && (
            <div className="text-right">
              <span className={`text-lg font-semibold ${scoreColor(a)}`}>{fmt(a)}</span>
              <p className="text-xs text-zinc-600">Schnitt</p>
            </div>
          )}
          {/* Edit-Button — stopPropagation verhindert Navigation zur Detail-Seite */}
          <button
            onClick={e => { e.stopPropagation(); setMode('edit') }}
            className="text-zinc-600 p-1"
            aria-label="Show bearbeiten"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Ratings */}
      <div className="flex flex-wrap gap-2">
        {persons.map(p => (
          <div key={p} className="flex items-center gap-1.5 bg-zinc-800 rounded-full px-3 py-1">
            <span className="text-xs text-zinc-500">{p}</span>
            <span className={`text-sm font-medium ${scoreColor(show.ratings[p])}`}>
              {show.ratings[p] > 10 ? `⚡${fmt(show.ratings[p])}` : fmt(show.ratings[p])}
            </span>
          </div>
        ))}
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
  const [shows, setShows] = useState<Show[]>([])
  const [filter, setFilter] = useState('Alle')
  const [loading, setLoading] = useState(true)

  function loadShows(f: string) {
    setLoading(true)
    const type = f === 'Alle' ? 'all' : f
    fetch(`/api/shows?type=${type}`)
      .then(r => r.json())
      .then((data: Show[]) => { setShows(data); setLoading(false) })
  }

  useEffect(() => { loadShows(filter) }, [filter])

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
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-8 lg:pt-16 lg:pb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Show-Bewertungen</p>
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-lg">WWE Rater</h1>
            <p className="text-zinc-400 mt-2 text-sm">Foffi · Jan · Björn · Curry</p>
          </div>
          <p className="text-zinc-500 text-sm shrink-0">{shows.length} Shows bewertet</p>
        </div>
      </div>

      {/* Filter-Chips + Show-Liste */}
      <div className="max-w-6xl mx-auto px-4 pb-24 lg:pb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-none">
          {FILTERS.map(f => (
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

        {loading && <p className="text-center text-zinc-600 py-12 text-sm">Lädt...</p>}

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
      </div>
    </div>
  )
}
