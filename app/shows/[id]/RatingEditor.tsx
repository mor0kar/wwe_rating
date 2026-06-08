'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fmt, scoreColor } from '@/lib/score'
import { useIdentity } from '@/lib/identity'

type Existing = Record<string, { score: number; note: string | null }>

type Props = {
  showId: number
  type: string
  date: string
  title: string
  comment?: string
  persons: string[]          // alle Personen
  existing: Existing          // vorhandene Bewertungen
}

export default function RatingEditor({ showId, type, date, title, comment: initialComment, persons, existing }: Props) {
  const router = useRouter()
  const { me, hideUntilRated } = useIdentity()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [comment, setComment] = useState(initialComment ?? '')

  // Spoiler-Modus: nur eigene Bewertung sichtbar, wenn Toggle an + ich kenne mich + noch nicht bewertet
  const iRated = !!me && me in existing
  const spoilerMode = hideUntilRated && !!me && !iRated
  // Im Spoiler-Modus wird der Editor auf die eigene Person reduziert
  const editablePersons = spoilerMode && me ? [me] : persons

  // "dabei": vorhandene Bewertungen sind aktiv, fehlende standardmäßig aus.
  // Im Spoiler-Modus ist die eigene Person automatisch "dabei" — sonst würde
  // der reduzierte Editor leer wirken.
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(persons.map(p => [p, p in existing || (spoilerMode && p === me)]))
  )
  // Basiswert = vorhandener Score (DANHAUSEN-Totale bleiben erhalten), sonst 7
  const [base, setBase] = useState<Record<string, number>>(() =>
    Object.fromEntries(persons.map(p => [p, existing[p]?.score ?? 7]))
  )
  const [danhausen, setDanhausen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(persons.map(p => [p, !!existing[p]?.note]))
  )
  const [bonus, setBonus] = useState<Record<string, number>>(() =>
    Object.fromEntries(persons.map(p => [p, 0]))
  )
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(persons.map(p => [p, existing[p]?.note ?? '']))
  )

  async function handleSave() {
    setSaving(true)

    // Spoiler-Modus: nur das eigene Rating per UPSERT speichern,
    // damit die Bewertungen der anderen unangetastet bleiben.
    if (spoilerMode && me) {
      if (active[me]) {
        const b = base[me] ?? 0
        const bo = danhausen[me] ? (bonus[me] ?? 0) : 0
        const score = b + bo
        const note = danhausen[me] && notes[me] ? notes[me] : null
        await fetch(`/api/shows/${showId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ person: me, score, note }),
        })
      }
      setSaving(false)
      setOpen(false)
      router.refresh()
      return
    }

    // Normaler Modus: alle Bewertungen via PATCH ersetzen
    const ratings: Record<string, number> = {}
    const noteMap: Record<string, string> = {}
    persons.forEach(p => {
      if (!active[p]) return
      const b = base[p] ?? 0
      const bo = danhausen[p] ? (bonus[p] ?? 0) : 0
      ratings[p] = b + bo
      if (danhausen[p] && notes[p]) noteMap[p] = notes[p]
    })
    await fetch(`/api/shows/${showId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, date, title, comment, ratings, notes: noteMap }),
    })
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <div className="mt-4">
        <button
          onClick={() => setOpen(true)}
          className={`w-full rounded-xl py-2.5 text-sm font-medium transition-colors ${
            spoilerMode
              ? 'bg-[#DC0000] hover:bg-red-700 text-white'
              : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-900'
          }`}
        >
          {spoilerMode ? 'Jetzt bewerten' : 'Bewertungen bearbeiten'}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="text-base font-semibold text-zinc-50 mb-3">
        {spoilerMode ? 'Deine Bewertung' : 'Bewertungen bearbeiten'}
      </h2>
      {spoilerMode && (
        <p className="text-xs text-zinc-500 mb-3">
          Andere Bewertungen sind ausgeblendet, bis du selbst gespeichert hast.
        </p>
      )}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
        {/* Kommentar / Spitzname für die Folge — im Spoiler-Modus ausgeblendet
            (würde sonst eh nicht gespeichert, weil POST nur Einzel-Ratings macht) */}
        {!spoilerMode && (
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Kommentar (optional, z.B. &quot;Die Stuhl-Match-Folge&quot;)</label>
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="So nennen wir die Folge intern"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-red-600 placeholder:text-zinc-600"
            />
          </div>
        )}

        {editablePersons.map(p => {
          const isOn = active[p] ?? false
          const b = base[p] ?? 0
          const bo = danhausen[p] ? (bonus[p] ?? 0) : 0
          const total = b + bo
          return (
            <div
              key={p}
              className={`rounded-xl border border-zinc-800 p-3 transition-opacity ${isOn ? '' : 'opacity-40'}`}
            >
              {/* Person + Dabei-Toggle */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-100">{p}</span>
                <div className="flex items-center gap-3">
                  {isOn && (
                    <span className={`text-base font-semibold ${
                      danhausen[p] ? 'text-purple-400 font-bold' : scoreColor(total)
                    }`}>
                      {danhausen[p] ? `⚡${fmt(total)}` : fmt(total)}
                    </span>
                  )}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <span className="text-xs text-zinc-500">dabei</span>
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={e => setActive(a => ({ ...a, [p]: e.target.checked }))}
                      className="accent-red-600 w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {isOn && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={Math.min(b, 10)}
                      onChange={e => setBase(r => ({ ...r, [p]: parseFloat(e.target.value) }))}
                      className="flex-1 accent-zinc-100"
                    />
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={Math.min(b, 10)}
                      onChange={e => {
                        const v = parseFloat(e.target.value)
                        if (!isNaN(v)) setBase(r => ({ ...r, [p]: Math.min(10, Math.max(0, v)) }))
                      }}
                      className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-zinc-50 outline-none focus:border-zinc-500 text-center"
                    />
                  </div>
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
                          min={0}
                          max={5}
                          step={0.1}
                          value={bonus[p] ?? 0}
                          onChange={e => setBonus(bn => ({ ...bn, [p]: parseFloat(e.target.value) || 0 }))}
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

        {/* Aktionen */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setOpen(false)}
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
    </div>
  )
}
