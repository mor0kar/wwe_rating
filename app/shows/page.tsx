'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Show = {
  id: number
  type: string
  date: string
  title: string
  ratings: Record<string, number>
}

const SHOW_TYPES = ['RAW', 'SmackDown', 'NXT', 'PLE', 'SNM']

const BADGE: Record<string, string> = {
  RAW: 'bg-red-50 text-red-800',
  SmackDown: 'bg-blue-50 text-blue-800',
  PLE: 'bg-purple-50 text-purple-800',
  SNM: 'bg-amber-50 text-amber-800',
  NXT: 'bg-green-50 text-green-800',
}

function scoreColor(s: number) {
  if (s > 10) return 'text-purple-600 font-bold'
  if (s >= 7) return 'text-green-600'
  if (s >= 4) return 'text-amber-600'
  return 'text-red-500'
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
  const [ratings, setRatings] = useState<Record<string, number>>({ ...show.ratings })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave({ type, date, title, ratings })
    setSaving(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
      {/* Typ-Auswahl */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Show-Typ</label>
        <div className="flex gap-2 flex-wrap">
          {SHOW_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                type === t ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Datum */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Datum</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-gray-400"
        />
      </div>

      {/* Titel */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Titel</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="optional"
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-gray-400"
        />
      </div>

      {/* Ratings */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Bewertungen</label>
        <div className="space-y-3">
          {Object.keys(ratings).map(p => (
            <div key={p}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-800">{p}</span>
                <span className={`text-base font-semibold ${
                  ratings[p] > 10 ? 'text-purple-600' :
                  ratings[p] >= 7 ? 'text-green-600' :
                  ratings[p] >= 4 ? 'text-amber-600' : 'text-red-500'
                }`}>
                  {ratings[p] > 10 ? `⚡${ratings[p]}` : ratings[p]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.5}
                value={ratings[p] ?? 7}
                onChange={e => setRatings(r => ({ ...r, [p]: parseFloat(e.target.value) }))}
                className="w-full accent-gray-900"
              />
              <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                <span>0</span><span>5</span><span>10</span><span>⚡15</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gray-900 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-50"
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

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer active:bg-gray-50 transition-colors"
      onClick={() => router.push(`/shows/${show.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${BADGE[show.type] || 'bg-gray-100 text-gray-700'}`}>
              {show.type}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {show.title || show.type}
            </span>
          </div>
          <p className="text-xs text-gray-400">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {a !== null && (
            <div className="text-right">
              <span className="text-lg font-semibold text-gray-900">{a.toFixed(1)}</span>
              <p className="text-xs text-gray-400">Schnitt</p>
            </div>
          )}
          {/* Edit-Button — stopPropagation verhindert Navigation zur Detail-Seite */}
          <button
            onClick={e => { e.stopPropagation(); setMode('edit') }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
          <div key={p} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1">
            <span className="text-xs text-gray-500">{p}</span>
            <span className={`text-sm font-medium ${scoreColor(show.ratings[p])}`}>
              {show.ratings[p] > 10 ? `⚡${show.ratings[p]}` : show.ratings[p]}
            </span>
          </div>
        ))}
      </div>

      {/* Löschen-Toggle */}
      {mode === 'confirmDelete' ? (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <p className="text-sm text-gray-600">Show wirklich löschen?</p>
          <div className="flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); setMode('view') }}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500"
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
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={e => { e.stopPropagation(); setMode('confirmDelete') }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
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
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* Header — Navigation jetzt in der Bottom Nav */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">WWE Rater</h1>
        <p className="text-sm text-gray-400 mt-0.5">{shows.length} Shows</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-400 py-12 text-sm">Lädt...</p>}

      <div className="space-y-3">
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
  )
}
