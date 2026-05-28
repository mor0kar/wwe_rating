'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPES = ['RAW', 'SmackDown', 'NXT', 'PLE', 'SNM']

export default function AddShowPage() {
  const router = useRouter()
  const [persons, setPersons] = useState<string[]>([])
  const [type, setType] = useState('RAW')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/persons').then(r => r.json()).then((ps: string[]) => {
      setPersons(ps)
      setRatings(Object.fromEntries(ps.map(p => [p, 7])))
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/shows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, date, title, ratings }),
    })
    router.push('/shows')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Neue Show</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Show</label>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`text-sm px-4 py-2 rounded-xl border transition-colors ${
                  type === t ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Datum</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Titel (optional, z.B. "Money in the Bank")</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="optional"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-3 block">Bewertungen</label>
          <div className="space-y-4">
            {persons.map(p => (
              <div key={p}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-800">{p}</span>
                  <span className={`text-lg font-semibold ${
                    ratings[p] > 10 ? 'text-purple-600' :
                    ratings[p] >= 7 ? 'text-green-600' :
                    ratings[p] >= 4 ? 'text-amber-600' : 'text-red-500'
                  }`}>{ratings[p]}</span>
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
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                  <span>⚡15</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gray-900 text-white rounded-xl py-3 font-medium disabled:opacity-50 mt-2"
        >
          {saving ? 'Speichern...' : 'Show speichern'}
        </button>
      </div>
    </div>
  )
}
