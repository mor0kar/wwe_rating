import Link from 'next/link'
import { notFound } from 'next/navigation'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

type ShowRow = { id: number; type: string; date: string; title: string }
type RatingRow = { show_id: number; person_name: string; score: number }

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

function scoreLabel(s: number) {
  if (s > 10) return `⚡${s}`
  return String(s)
}

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
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Zurück-Link */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/shows" className="text-gray-400 text-sm">← Shows</Link>
      </div>

      {/* Show-Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${BADGE[show.type] || 'bg-gray-100 text-gray-700'}`}>
            {show.type}
          </span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mt-2">
          {show.title || show.type}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{dateStr}</p>
      </div>

      {/* Ratings */}
      <h2 className="text-sm font-medium text-gray-700 mb-3">Bewertungen</h2>
      {ratings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <p className="text-sm text-gray-400">Keine Bewertungen vorhanden.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-3">
          {ratings.map(r => {
            const score = Number(r.score)
            return (
              <div key={r.person_name} className="flex items-center justify-between">
                <span className="text-sm text-gray-800">{r.person_name}</span>
                <span className={`text-base font-semibold ${scoreColor(score)}`}>
                  {scoreLabel(score)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Statistik-Cards */}
      {ratings.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Auswertung</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Durchschnitt */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Ø Durchschnitt</p>
              <p className={`text-2xl font-semibold ${avg !== null ? scoreColor(avg) : 'text-gray-900'}`}>
                {avg !== null ? avg.toFixed(1) : '—'}
              </p>
            </div>

            {/* Spread */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Spread</p>
              <p className="text-2xl font-semibold text-gray-900">
                {spread !== null ? `±${spread.toFixed(1)}` : '—'}
              </p>
            </div>
          </div>

          {/* Höchste / Niedrigste Bewertung */}
          {highestRating && lowestRating && highestRating.person_name !== lowestRating.person_name && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Höchste Bewertung</span>
                <span className="text-sm text-gray-800">
                  {highestRating.person_name}{' '}
                  <span className={`font-semibold ${scoreColor(Number(highestRating.score))}`}>
                    {scoreLabel(Number(highestRating.score))}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Niedrigste Bewertung</span>
                <span className="text-sm text-gray-800">
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
    </div>
  )
}
