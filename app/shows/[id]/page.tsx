import Link from 'next/link'
import { notFound } from 'next/navigation'
import sql from '@/lib/db'
import RatingEditor from './RatingEditor'
import { getShowLogo, BADGE, BORDER_ACCENT, TINT } from '@/lib/showStyle'
import { scoreColor, scoreLabel } from '@/lib/score'
import ScoreRing from '@/app/components/ScoreRing'

export const dynamic = 'force-dynamic'

type ShowRow = { id: number; type: string; date: string; title: string }
type RatingRow = { show_id: number; person_name: string; score: number; note: string | null }
type PersonRow = { name: string }

export default async function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id, 10)

  if (isNaN(numId)) notFound()

  const shows = await sql`SELECT * FROM shows WHERE id = ${numId}` as unknown as ShowRow[]
  if (!shows.length) notFound()

  const show = shows[0]
  const ratings = await sql`
    SELECT * FROM ratings WHERE show_id = ${numId} ORDER BY person_name
  ` as unknown as RatingRow[]

  // Alle Personen laden, um unbewertet vs. bewertet zu ermitteln
  const allPersons = await sql`SELECT name FROM persons ORDER BY id` as unknown as PersonRow[]

  // Vorhandene Bewertungen als Map (Score + Note) für den Editor
  const existing: Record<string, { score: number; note: string | null }> = Object.fromEntries(
    ratings.map(r => [r.person_name, { score: Number(r.score), note: r.note ?? null }])
  )

  const scores = ratings.map(r => Number(r.score))
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  const spread = scores.length >= 2 ? Math.max(...scores) - Math.min(...scores) : null

  const highestRating = scores.length
    ? ratings.reduce((best, r) => Number(r.score) >= Number(best.score) ? r : best)
    : null
  const lowestRating = scores.length
    ? ratings.reduce((worst, r) => Number(r.score) <= Number(worst.score) ? r : worst)
    : null

  const dateStr = new Date(show.date + 'T12:00:00').toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Zurück-Link */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/shows" className="text-zinc-500 text-sm">← Shows</Link>
      </div>

      {/* Show-Header */}
      <div className={`relative overflow-hidden bg-zinc-900 border border-zinc-800 border-l-4 ${BORDER_ACCENT[show.type] || 'border-l-zinc-700'} rounded-2xl p-5 mb-4`}>
        <div className={`absolute inset-0 pointer-events-none ${TINT[show.type] || ''}`} />
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            {getShowLogo(show.type, show.title) ? (
              <img src={getShowLogo(show.type, show.title)!} alt={show.title || show.type} className="h-11 object-contain mb-3" />
            ) : (
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md mb-3 ${BADGE[show.type] || 'bg-zinc-800 text-zinc-300'}`}>
                {show.type}
              </span>
            )}
            <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-zinc-50 leading-tight">
              {show.title || show.type}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">{dateStr}</p>
          </div>
          {avg !== null && (
            <div className="flex flex-col items-center shrink-0">
              <ScoreRing value={avg} size={76} stroke={5} />
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1.5">Schnitt</span>
            </div>
          )}
        </div>
      </div>

      {/* Ratings */}
      <h2 className="text-sm font-medium text-zinc-400 mb-3">Bewertungen</h2>
      {ratings.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
          <p className="text-sm text-zinc-500">Keine Bewertungen vorhanden.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 space-y-3">
          {ratings.map(r => {
            const score = Number(r.score)
            return (
              <div key={r.person_name}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-100">{r.person_name}</span>
                  <span className={`text-base font-semibold ${scoreColor(score)}`}>
                    {scoreLabel(score)}
                  </span>
                </div>
                {r.note && r.note.trim() !== '' && (
                  <p className="text-xs text-zinc-500 italic mt-0.5">{r.note}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Statistik-Cards */}
      {ratings.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Auswertung</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Durchschnitt */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Ø Durchschnitt</p>
              <p className={`text-2xl font-semibold ${avg !== null ? scoreColor(avg) : 'text-zinc-50'}`}>
                {avg !== null ? avg.toFixed(1) : '—'}
              </p>
            </div>

            {/* Spread */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Spread</p>
              <p className="text-2xl font-semibold text-zinc-50">
                {spread !== null ? `±${spread.toFixed(1)}` : '—'}
              </p>
            </div>
          </div>

          {/* Höchste / Niedrigste Bewertung */}
          {highestRating && lowestRating && highestRating.person_name !== lowestRating.person_name && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Höchste Bewertung</span>
                <span className="text-sm text-zinc-100">
                  {highestRating.person_name}{' '}
                  <span className={`font-semibold ${scoreColor(Number(highestRating.score))}`}>
                    {scoreLabel(Number(highestRating.score))}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Niedrigste Bewertung</span>
                <span className="text-sm text-zinc-100">
                  {lowestRating.person_name}{' '}
                  <span className={`font-semibold ${scoreColor(Number(lowestRating.score))}`}>
                    {scoreLabel(Number(lowestRating.score))}
                  </span>
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bewertungen hinzufügen / anpassen */}
      <RatingEditor
        showId={numId}
        type={show.type}
        date={show.date}
        title={show.title ?? ''}
        persons={allPersons.map(p => p.name)}
        existing={existing}
      />
    </div>
  )
}
