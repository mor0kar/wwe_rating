import sql from '@/lib/db'
import { getShowLogo, BADGE, SHOW_TYPES } from '@/lib/showStyle'
import { scoreColor, avgScore } from '@/lib/score'
import ScoreTimeline from './ScoreTimeline'

export const dynamic = 'force-dynamic'

type ShowRow = { id: number; type: string; date: string; title: string }
type RatingRow = { show_id: number; person_name: string; score: number }
type PersonRow = { name: string }

async function getStats() {
  const shows = await sql`SELECT * FROM shows ORDER BY date DESC` as unknown as ShowRow[]
  const ratings = await sql`SELECT * FROM ratings` as unknown as RatingRow[]
  const persons = await sql`SELECT name FROM persons ORDER BY id` as unknown as PersonRow[]

  const showsWithRatings = shows.map(show => ({
    ...show,
    ratings: Object.fromEntries(
      ratings.filter(r => r.show_id === show.id).map(r => [r.person_name, Number(r.score)])
    ) as Record<string, number>,
  }))

  const allScores = ratings.map(r => Number(r.score))
  const globalAvg = avgScore(allScores)
  const pleScores = ratings.filter(r => {
    const show = shows.find(s => s.id === r.show_id)
    return show?.type === 'PLE'
  }).map(r => Number(r.score))

  const personStats = persons.map(p => {
    const sc = ratings.filter(r => r.person_name === p.name).map(r => Number(r.score))
    return { name: p.name, avg: avgScore(sc), count: sc.length }
  }).filter(p => p.avg !== null).sort((a, b) => b.avg! - a.avg!)

  const showAvgs = showsWithRatings.map(s => {
    const sc = Object.values(s.ratings)
    return { ...s, avg: avgScore(sc) }
  }).filter(s => s.avg !== null).sort((a, b) => b.avg! - a.avg!)

  const typeStats = SHOW_TYPES.map(type => {
    const typeShows = showsWithRatings.filter(s => s.type === type)
    const sc = typeShows.flatMap(s => Object.values(s.ratings))
    return { type, avg: avgScore(sc), count: typeShows.length }
  }).filter(t => t.count > 0)

  // Verlauf: Show-Durchschnitte chronologisch (für den Score-Chart)
  const timeline = showsWithRatings
    .map(s => ({ id: s.id, date: s.date, type: s.type, title: s.title, avg: avgScore(Object.values(s.ratings)) }))
    .filter((s): s is { id: number; date: string; type: string; title: string; avg: number } => s.avg !== null)
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    globalAvg,
    pleAvg: avgScore(pleScores),
    totalShows: shows.length,
    totalRatings: allScores.length,
    personStats,
    topShows: showAvgs.slice(0, 5),
    flopShows: [...showAvgs].reverse().slice(0, 3),
    typeStats,
    timeline,
  }
}

function showTypeBadge(type: string, className = 'h-4', title?: string) {
  const logo = getShowLogo(type, title)
  if (logo) {
    return <img src={logo} alt={title || type} className={`${className} object-contain shrink-0`} loading="lazy" />
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ${BADGE[type] || 'bg-zinc-800 text-zinc-300'}`}>
      {type}
    </span>
  )
}

// Typ-Farbe für Progress-Bars
const TYPE_BAR: Record<string, string> = {
  RAW: 'bg-red-500',
  SmackDown: 'bg-blue-500',
  PLE: 'bg-purple-500',
  SNM: 'bg-amber-500',
  NXT: 'bg-green-500',
}

function barColor(avg: number) {
  if (avg >= 8.0) return 'bg-green-500'
  if (avg >= 6.0) return 'bg-amber-500'
  return 'bg-red-500'
}

// Rang-Badge: Gold / Silber / Bronze für Platz 1/2/3
function rankBadge(i: number) {
  if (i === 0) return 'text-amber-400 font-bold'
  if (i === 1) return 'text-zinc-300 font-semibold'
  if (i === 2) return 'text-amber-700 font-semibold'
  return 'text-zinc-500'
}

export default async function StatsPage() {
  const stats = await getStats()

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 mb-8">
        <div className="absolute inset-0 texture-grain opacity-[0.06] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,0,0,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 lg:py-12">
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Season Rankings</p>
          <h1 className="text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white">Hall of Fame</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24 lg:pb-8">
        {/* Übersichts-Cards — 2 auf Mobile, 4 auf Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Shows gesamt', value: stats.totalShows, isScore: false },
            { label: 'Ø Gesamt', value: stats.globalAvg?.toFixed(1) ?? '—', isScore: true, score: stats.globalAvg },
            { label: 'Ø PLEs', value: stats.pleAvg?.toFixed(1) ?? '—', isScore: true, score: stats.pleAvg },
            { label: 'Bewertungen', value: stats.totalRatings, isScore: false },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className={`font-heading text-4xl font-bold tabular-nums ${s.isScore && s.score != null ? scoreColor(s.score) : 'text-zinc-50'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Score-Verlauf über die Saison */}
        {stats.timeline.length >= 2 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-zinc-50 uppercase tracking-wide">
                Score-Verlauf
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="inline-block w-3 border-t border-dashed border-zinc-500" />
                Ø Gesamt
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <ScoreTimeline data={stats.timeline} globalAvg={stats.globalAvg} />
            </div>
          </div>
        )}

        {/* Zweispaltig auf Desktop: Links Personen + Typ-Schnitt, Rechts Top5 + Flop3 */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
          {/* Linke Spalte */}
          <div className="space-y-6">
            {/* Personen-Ranking */}
            <div>
              <h2 className="text-base font-semibold text-zinc-50 uppercase tracking-wide mb-3">
                Durchschnitt pro Person
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                {stats.personStats.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className={`text-sm w-5 text-center ${rankBadge(i)}`}>{i + 1}</span>
                    <span className="text-sm flex-1 text-zinc-100">
                      {p.name}{' '}
                      <span className="text-xs text-zinc-500">({p.count}x)</span>
                    </span>
                    <div className="flex-[2] bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor(p.avg!)}`}
                        style={{ width: `${Math.min((p.avg! / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold w-8 text-right ${scoreColor(p.avg!)}`}>
                      {p.avg!.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schnitt pro Show-Typ */}
            <div>
              <h2 className="text-base font-semibold text-zinc-50 uppercase tracking-wide mb-3">
                Schnitt pro Show-Typ
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                {stats.typeStats.map(t => (
                  <div key={t.type} className="flex items-center gap-3">
                    <div className="w-20 shrink-0 flex items-center">
                      {showTypeBadge(t.type, 'h-4')}
                    </div>
                    <span className="text-xs text-zinc-500 flex-1">{t.count} Shows</span>
                    <div className="flex-[2] bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${TYPE_BAR[t.type] || 'bg-zinc-500'}`}
                        style={{ width: `${Math.min((t.avg! / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold w-8 text-right ${scoreColor(t.avg!)}`}>
                      {t.avg!.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rechte Spalte */}
          <div className="space-y-6">
            {/* Top 5 Shows */}
            <div>
              <h2 className="text-base font-semibold text-zinc-50 uppercase tracking-wide mb-3">
                Top 5 Shows
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                {stats.topShows.map((s, i) => {
                  const dateStr = new Date(s.date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className={`text-sm w-5 text-center ${rankBadge(i)}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {showTypeBadge(s.type, 'h-3.5', s.title)}
                          <span className="text-sm text-zinc-100 truncate">{s.title || s.type}</span>
                          <span className="text-xs text-zinc-500">{dateStr}</span>
                        </div>
                      </div>
                      <div className="flex-[2] bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor(s.avg!)}`}
                          style={{ width: `${Math.min((s.avg! / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold w-8 text-right ${scoreColor(s.avg!)}`}>
                        {s.avg!.toFixed(1)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Flop 3 Shows */}
            <div>
              <h2 className="text-base font-semibold text-zinc-50 uppercase tracking-wide mb-3">
                Flop 3 Shows
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                {stats.flopShows.map((s, i) => {
                  const dateStr = new Date(s.date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="text-sm w-5 text-center text-zinc-500">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {showTypeBadge(s.type, 'h-3.5', s.title)}
                          <span className="text-sm text-zinc-100 truncate">{s.title || s.type}</span>
                          <span className="text-xs text-zinc-500">{dateStr}</span>
                        </div>
                      </div>
                      <div className="flex-[2] bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor(s.avg!)}`}
                          style={{ width: `${Math.min((s.avg! / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold w-8 text-right ${scoreColor(s.avg!)}`}>
                        {s.avg!.toFixed(1)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
