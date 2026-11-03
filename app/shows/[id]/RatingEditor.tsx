'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIdentity } from '@/lib/identity'
import PersonRatingRow, { draftTotal, type RatingDraft } from '@/app/components/PersonRatingRow'
import type { Moment } from '@/lib/score'

type Existing = Record<string, { score: number; note: string | null; moment: 'up' | 'down' | null }>

type Props = {
  showId: number
  comment?: string
  persons: string[]          // alle Personen
  existing: Existing          // vorhandene Bewertungen
}

export default function RatingEditor({ showId, comment: initialComment, persons, existing }: Props) {
  const router = useRouter()
  const { me, hideUntilRated } = useIdentity()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState(initialComment ?? '')

  // Spoiler-Modus: nur eigene Bewertung sichtbar, wenn Toggle an + ich kenne mich + noch nicht bewertet
  const iRated = !!me && me in existing
  const spoilerMode = hideUntilRated && !!me && !iRated
  // Im Spoiler-Modus wird der Editor auf die eigene Person reduziert
  const editablePersons = spoilerMode && me ? [me] : persons

  // Entwurf aus dem aktuellen Server-Stand. Wird bei jedem Öffnen neu gebaut —
  // sonst editiert man einen veralteten Stand (jemand hat zwischendurch bewertet)
  // bzw. im Spoiler-Modus eine deaktivierte eigene Zeile, weil useIdentity "me"
  // beim ersten Render noch nicht kennt.
  // "dabei": vorhandene Bewertungen sind aktiv, fehlende standardmäßig aus; im
  // Spoiler-Modus ist die eigene Person automatisch "dabei".
  // Basiswert = vorhandener Score (Moment-Totale bleiben erhalten, weil bonus mit 0
  // startet → base±0 = gespeicherter Score), sonst 7
  function buildDrafts(): Record<string, RatingDraft> {
    return Object.fromEntries(persons.map(p => [p, {
      active: p in existing || (spoilerMode && p === me),
      base: existing[p]?.score ?? 7,
      moment: existing[p]?.moment ?? null,
      bonus: 0,
      note: existing[p]?.note ?? '',
    }]))
  }
  const [drafts, setDrafts] = useState<Record<string, RatingDraft>>(buildDrafts)

  function openEditor() {
    setDrafts(buildDrafts())
    setComment(initialComment ?? '')
    setError(null)
    setOpen(true)
  }

  async function handleSave() {
    // Nur Änderungen schicken: unveränderte Personen bleiben serverseitig
    // unangetastet, auch wenn jemand anderes sie inzwischen bearbeitet hat.
    const ratings: Record<string, number> = {}
    const noteMap: Record<string, string> = {}
    const momentMap: Record<string, Moment> = {}
    const removed: string[] = []
    for (const p of editablePersons) {
      const d = drafts[p]
      const orig = existing[p]
      if (!d) continue
      if (!d.active) {
        if (orig) removed.push(p)
        continue
      }
      const total = draftTotal(d)
      const note = d.moment && d.note ? d.note : null
      const unchanged = !!orig
        && Math.abs(orig.score - total) < 0.005
        && orig.moment === d.moment
        && (!d.moment || (orig.note ?? null) === note)
      if (unchanged) continue
      ratings[p] = total
      if (d.moment) {
        momentMap[p] = d.moment
        if (note) noteMap[p] = note
      }
    }
    const body: Record<string, unknown> = { ratings, notes: noteMap, moments: momentMap, removed }
    // Kommentar nur im normalen Modus und nur wenn geändert
    const commentChanged = !spoilerMode && comment !== (initialComment ?? '')
    if (commentChanged) body.comment = comment

    if (!Object.keys(ratings).length && !removed.length && !commentChanged) {
      setOpen(false)
      return
    }

    setSaving(true)
    setError(null)
    const res = await fetch(`/api/shows/${showId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null)
    setSaving(false)
    if (!res?.ok) {
      setError('Speichern hat nicht geklappt. Bitte nochmal versuchen.')
      return
    }
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <div className="mt-4">
        <button
          onClick={openEditor}
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
            (dort wird nur die eigene Bewertung gespeichert) */}
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
            draft={drafts[p] ?? { active: false, base: 7, moment: null, bonus: 0, note: '' }}
            onChange={patch => setDrafts(d => ({ ...d, [p]: { ...d[p], ...patch } }))}
          />
        ))}

        {error && <p className="text-xs text-red-400" role="alert">{error}</p>}

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
