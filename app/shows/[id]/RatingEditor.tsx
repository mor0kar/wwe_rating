'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIdentity } from '@/lib/identity'
import PersonRatingRow, { draftTotal } from '@/app/components/PersonRatingRow'
import type { Moment } from '@/lib/score'

type Existing = Record<string, { score: number; note: string | null; moment: 'up' | 'down' | null }>

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
  // Basiswert = vorhandener Score (Moment-Totale bleiben erhalten, weil bonus mit 0
  // startet → base±0 = gespeicherter Score), sonst 7
  const [base, setBase] = useState<Record<string, number>>(() =>
    Object.fromEntries(persons.map(p => [p, existing[p]?.score ?? 7]))
  )
  const [moment, setMoment] = useState<Record<string, Moment | null>>(() =>
    Object.fromEntries(persons.map(p => [p, existing[p]?.moment ?? null]))
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
        const m = moment[me] ?? null
        const score = draftTotal({ base: base[me] ?? 0, moment: m, bonus: bonus[me] ?? 0 })
        const note = m && notes[me] ? notes[me] : null
        await fetch(`/api/shows/${showId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ person: me, score, note, moment: m }),
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
    const momentMap: Record<string, Moment> = {}
    persons.forEach(p => {
      if (!active[p]) return
      const m = moment[p] ?? null
      ratings[p] = draftTotal({ base: base[p] ?? 0, moment: m, bonus: bonus[p] ?? 0 })
      if (m) {
        momentMap[p] = m
        if (notes[p]) noteMap[p] = notes[p]
      }
    })
    await fetch(`/api/shows/${showId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, date, title, comment, ratings, notes: noteMap, moments: momentMap }),
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

        {editablePersons.map(p => (
          <PersonRatingRow
            key={p}
            name={p}
            className="rounded-xl border border-zinc-800 p-3"
            draft={{
              active: active[p] ?? false,
              base: base[p] ?? 0,
              moment: moment[p] ?? null,
              bonus: bonus[p] ?? 0,
              note: notes[p] ?? '',
            }}
            onChange={patch => {
              if ('active' in patch) setActive(a => ({ ...a, [p]: patch.active! }))
              if ('base' in patch) setBase(r => ({ ...r, [p]: patch.base! }))
              if ('moment' in patch) setMoment(m => ({ ...m, [p]: patch.moment! }))
              if ('bonus' in patch) setBonus(bn => ({ ...bn, [p]: patch.bonus! }))
              if ('note' in patch) setNotes(n => ({ ...n, [p]: patch.note! }))
            }}
          />
        ))}

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
