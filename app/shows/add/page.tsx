'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const TYPES = ['RAW', 'SmackDown', 'PLE', 'SNM']

function fmt(n: number): string {
  const s = parseFloat(n.toFixed(2)).toString()
  return s.includes('.') ? s : s + '.0'
}

function AddShowForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [persons, setPersons] = useState<string[]>([])
  const [type, setType] = useState(params.get('type') ?? 'RAW')
  const [date, setDate] = useState(params.get('date') ?? new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState(params.get('title') ?? '')
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [danhausen, setDanhausen] = useState<Record<string, boolean>>({})
  const [bonuses, setBonuses] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/persons').then(r => r.json()).then((ps: string[]) => {
      setPersons(ps)
      setRatings(Object.fromEntries(ps.map(p => [p, 7])))
      setActive(Object.fromEntries(ps.map(p => [p, true])))
      setDanhausen(Object.fromEntries(ps.map(p => [p, false])))
      setBonuses(Object.fromEntries(ps.map(p => [p, 0])))
      setNotes(Object.fromEntries(ps.map(p => [p, ''])))
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const effectiveRatings: Record<string, number> = {}
    const effectiveNotes: Record<string, string> = {}
    persons.forEach(p => {
      if (!active[p]) return
      const base = ratings[p] ?? 0
      const bonus = danhausen[p] ? (bonuses[p] ?? 0) : 0
      effectiveRatings[p] = base + bonus
      if (danhausen[p] && notes[p]) effectiveNotes[p] = notes[p]
    })
    await fetch('/api/shows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, date, title, ratings: effectiveRatings, notes: effectiveNotes }),
    })
    router.push('/shows')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50 uppercase tracking-wide">Show eintragen</h1>
        <p className="text-xs text-zinc-600 mt-1">Personen ohne Bewertung einfach deaktivieren</p>
      </div>

      <div className="space-y-4">
        {/* Show-Typ */}
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Show-Typ</label>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`text-sm px-4 py-2 rounded-xl border transition-colors ${
                  type === t ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'border-zinc-700 text-zinc-300'
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
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-zinc-500"
          />
        </div>

        {/* Titel */}
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Titel (optional, z.B. &quot;Money in the Bank&quot;)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="optional"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          />
        </div>

        {/* Bewertungen */}
        <div>
          <label className="text-xs text-zinc-500 mb-3 block">Bewertungen</label>
          <div className="space-y-4">
            {persons.map(p => {
              const isActive = active[p] ?? true
              const base = ratings[p] ?? 0
              const bonus = danhausen[p] ? (bonuses[p] ?? 0) : 0
              const total = base + bonus
              return (
                <div
                  key={p}
                  className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-opacity ${isActive ? '' : 'opacity-40'}`}
                >
                  {/* Person + Dabei-Toggle */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-zinc-100">{p}</span>
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <span className={`text-lg font-semibold ${
                          total > 10 ? 'text-purple-400 font-bold' :
                          total >= 7 ? 'text-green-400' :
                          total >= 4 ? 'text-amber-500' : 'text-red-400'
                        }`}>
                          {total > 10 ? `⚡${fmt(total)}` : fmt(total)}
                        </span>
                      )}
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span className="text-xs text-zinc-500">dabei</span>
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={e => setActive(a => ({ ...a, [p]: e.target.checked }))}
                          className="accent-red-600 w-4 h-4"
                        />
                      </label>
                    </div>
                  </div>

                  {isActive && (
                    <div className="space-y-1.5">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.01}
                        value={base}
                        onChange={e => setRatings(r => ({ ...r, [p]: parseFloat(e.target.value) }))}
                        className="w-full accent-zinc-100"
                      />
                      <div className="flex justify-between text-xs text-zinc-600">
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
                        <span className="text-xs text-zinc-500">⚡ DANHAUSEN-Moment</span>
                      </label>

                      {danhausen[p] && (
                        <div className="space-y-1.5 pl-6 pt-1">
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
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#DC0000] hover:bg-red-700 text-white rounded-xl py-3 font-bold uppercase tracking-wide disabled:opacity-50 mt-2 transition-colors"
        >
          {saving ? 'Speichern...' : 'Show speichern'}
        </button>
      </div>
    </div>
  )
}

// useSearchParams() muss in einer Suspense-Grenze liegen (Next.js 16)
export default function AddShowPage() {
  return (
    <Suspense fallback={null}>
      <AddShowForm />
    </Suspense>
  )
}
