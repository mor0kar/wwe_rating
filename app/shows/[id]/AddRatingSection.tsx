'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  showId: number
  unratedPersons: string[]
}

export default function AddRatingSection({ showId, unratedPersons }: Props) {
  const router = useRouter()
  const [person, setPerson] = useState(unratedPersons[0] ?? '')
  const [score, setScore] = useState(7.0)
  const [danhausen, setDanhausen] = useState(false)
  const [bonus, setBonus] = useState(0.5)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (unratedPersons.length === 0) return null

  const total = score + (danhausen ? bonus : 0)

  function scoreColor(s: number) {
    if (s > 10) return 'text-purple-400 font-bold'
    if (s >= 7) return 'text-green-400'
    if (s >= 4) return 'text-amber-500'
    return 'text-red-400'
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/shows/${showId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        person,
        score: total,
        note: danhausen && note ? note : undefined,
      }),
    })
    router.refresh()
    setSaving(false)
    // Formular zurücksetzen
    setScore(7.0)
    setDanhausen(false)
    setNote('')
  }

  return (
    <div className="mt-4">
      <h2 className="text-base font-semibold text-zinc-50 mb-3">Bewertung hinzufügen</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
        {/* Person auswählen */}
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Person</label>
          <select
            value={person}
            onChange={e => setPerson(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-red-600"
          >
            {unratedPersons.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Score-Slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-zinc-500">Bewertung</label>
            <span className={`text-lg font-semibold ${scoreColor(total)}`}>
              {total > 10 ? `⚡${total.toFixed(1)}` : total.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0} max={10} step={0.1}
            value={score}
            onChange={e => setScore(parseFloat(e.target.value))}
            className="w-full accent-red-600"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
            <span>0</span><span>5</span><span>10</span>
          </div>
        </div>

        {/* DANHAUSEN-Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={danhausen}
            onChange={e => setDanhausen(e.target.checked)}
            className="accent-purple-400 w-4 h-4"
          />
          <span className="text-xs text-zinc-400">⚡ DANHAUSEN-Moment</span>
        </label>

        {danhausen && (
          <div className="space-y-2 pl-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Bonus:</span>
              <input
                type="number" min={0.1} max={5.0} step={0.1}
                value={bonus}
                onChange={e => setBonus(parseFloat(e.target.value) || 0)}
                className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-50 outline-none focus:border-purple-500 text-center"
              />
            </div>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder='Begründung (z.B. "Holy shit"-Moment)'
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-50 outline-none focus:border-purple-500 placeholder:text-zinc-600"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !person}
          className="w-full bg-[#DC0000] hover:bg-red-700 text-white rounded-xl py-2.5 text-sm font-bold uppercase tracking-wide disabled:opacity-50 transition-colors"
        >
          {saving ? 'Speichern...' : 'Bewertung speichern'}
        </button>
      </div>
    </div>
  )
}
