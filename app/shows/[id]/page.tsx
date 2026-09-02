import Link from 'next/link'
import { notFound } from 'next/navigation'
import sql from '@/lib/db'
import RatingEditor from './RatingEditor'
import RatingsView from './RatingsView'
import HeaderScore from './HeaderScore'
import { BORDER_ACCENT, TINT } from '@/lib/showStyle'
import ShowLogo from '@/app/components/ShowLogo'
import { fmtDateFull } from '@/lib/format'

export const dynamic = 'force-dynamic'

type ShowRow = { id: number; type: string; date: string; title: string; comment: string | null }
type RatingRow = { show_id: number; person_name: string; score: number; note: string | null; moment: 'up' | 'down' | null }
type PersonRow = { name: string }

export default async function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id, 10)

  if (isNaN(numId)) notFound()

  // Unabhängige Queries parallel; Personen-Liste ermittelt unbewertet vs. bewertet
  const [shows, ratings, allPersons] = await Promise.all([
    sql`SELECT * FROM shows WHERE id = ${numId}` as unknown as Promise<ShowRow[]>,
    sql`SELECT * FROM ratings WHERE show_id = ${numId} ORDER BY person_name` as unknown as Promise<RatingRow[]>,
    sql`SELECT name FROM persons ORDER BY id` as unknown as Promise<PersonRow[]>,
  ])
  if (!shows.length) notFound()
  const show = shows[0]

  // Vorhandene Bewertungen als Map (Score + Note + Moment) für den Editor
  const existing: Record<string, { score: number; note: string | null; moment: 'up' | 'down' | null }> =
    Object.fromEntries(
      ratings.map(r => [r.person_name, { score: Number(r.score), note: r.note ?? null, moment: r.moment ?? null }])
    )

  const scores = ratings.map(r => Number(r.score))
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null

  const dateStr = fmtDateFull(show.date)

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
            <div className="mb-3">
              <ShowLogo type={show.type} title={show.title} placeholder="wordmark" heightClass="h-11" badgeClass="inline-block text-xs font-medium px-2 py-0.5" />
            </div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-zinc-50 leading-tight">
              {show.title || show.type}
            </h1>
            {show.comment && show.comment.trim() !== '' && (
              <p className="text-sm text-zinc-300 italic mt-1">&ldquo;{show.comment}&rdquo;</p>
            )}
            <p className="text-sm text-zinc-500 mt-1">{dateStr}</p>
          </div>
          {avg !== null && (
            <div className="flex flex-col items-center shrink-0">
              <HeaderScore avg={avg} ratedBy={ratings.map(r => r.person_name)} />
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1.5">Schnitt</span>
            </div>
          )}
        </div>
      </div>

      {/* Ratings + Auswertung (Client-Component wegen Spoiler-Logik) */}
      <RatingsView
        ratings={ratings.map(r => ({
          person_name: r.person_name,
          score: Number(r.score),
          note: r.note ?? null,
          moment: r.moment ?? null,
        }))}
      />

      {/* Bewertungen hinzufügen / anpassen */}
      <RatingEditor
        showId={numId}
        type={show.type}
        date={show.date}
        title={show.title ?? ''}
        comment={show.comment ?? ''}
        persons={allPersons.map(p => p.name)}
        existing={existing}
      />
    </div>
  )
}
