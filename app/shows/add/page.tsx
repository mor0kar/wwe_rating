'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SHOW_TYPES } from '@/lib/showStyle'
import PersonRatingRow from '@/app/components/PersonRatingRow'

function AddShowForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [persons, setPersons] = useState<string[]>([])
  const [type, setType] = useState(params.get('type') ?? 'RAW')
  const [date, setDate] = useState(params.get('date') ?? new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState(params.get('title') ?? '')
  const [comment, setComment] = useState('')
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
      body: JSON.stringify({ type, date, title, comment, ratings: effectiveRatings, notes: effectiveNotes }),
    })
    router.push('/shows')
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 texture-grain opacity-[0.06] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,0,0,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-4 pt-10 pb-6">
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Neue Show</p>
          <h1 className="text-4xl font-bold uppercase tracking-tight text-white">Show eintragen</h1>
          <p className="text-zinc-500 text-xs mt-1">Personen ohne Bewertung einfach deaktivieren</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 space-y-4 animate-fade-in">
        {/* Show-Typ */}
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Show-Typ</label>
          <div className="flex gap-2 flex-wrap">
            {SHOW_TYPES.map(t => (
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
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-red-600"
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
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-red-600 placeholder:text-zinc-600"
          />
        </div>

        {/* Kommentar / Spitzname für die Folge */}
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Kommentar (optional, z.B. &quot;Die Stuhl-Match-Folge&quot;)</label>
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="So nennen wir die Folge intern"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-red-600 placeholder:text-zinc-600"
          />
        </div>

        {/* Bewertungen */}
        <div>
          <label className="text-xs text-zinc-500 mb-3 block">Bewertungen</label>
          <div className="space-y-4">
            {persons.map(p => (
              <PersonRatingRow
                key={p}
                name={p}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                draft={{
                  active: active[p] ?? true,
                  base: ratings[p] ?? 0,
                  danhausen: danhausen[p] ?? false,
                  bonus: bonuses[p] ?? 0,
                  note: notes[p] ?? '',
                }}
                onChange={patch => {
                  if ('active' in patch) setActive(a => ({ ...a, [p]: patch.active! }))
                  if ('base' in patch) setRatings(r => ({ ...r, [p]: patch.base! }))
                  if ('danhausen' in patch) setDanhausen(d => ({ ...d, [p]: patch.danhausen! }))
                  if ('bonus' in patch) setBonuses(b => ({ ...b, [p]: patch.bonus! }))
                  if ('note' in patch) setNotes(n => ({ ...n, [p]: patch.note! }))
                }}
              />
            ))}
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
