import sql from '@/lib/db'

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

  function avg(scores: number[]) {
    if (!scores.length) return null
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }

  const allScores = ratings.map(r => Number(r.score))
  const globalAvg = avg(allScores)
  const pleScores = ratings.filter(r => {
    const show = shows.find(s => s.id === r.show_id)
    return show?.type === 'PLE'
  }).map(r => Number(r.score))

  const personStats = persons.map(p => {
    const sc = ratings.filter(r => r.person_name === p.name).map(r => Number(r.score))
    return { name: p.name, avg: avg(sc), count: sc.length }
  }).filter(p => p.avg !== null).sort((a, b) => b.avg! - a.avg!)

  const showAvgs = showsWithRatings.map(s => {
    const sc = Object.values(s.ratings)
    return { ...s, avg: avg(sc) }
  }).filter(s => s.avg !== null).sort((a, b) => b.avg! - a.avg!)

  const typeStats = ['RAW', 'SmackDown', 'PLE', 'SNM', 'NXT'].map(type => {
    const typeShows = showsWithRatings.filter(s => s.type === type)
    const sc = typeShows.flatMap(s => Object.values(s.ratings))
    return { type, avg: avg(sc), count: typeShows.length }
  }).filter(t => t.count > 0)

  return { globalAvg, pleAvg: avg(pleScores), totalShows: shows.length, totalRatings: allScores.length, personStats, topShows: showAvgs.slice(0, 5), typeStats }
}

const BADGE: Record<string, string> = {
  RAW: 'bg-red-50 text-red-800',
  SmackDown: 'bg-blue-50 text-blue-800',
  PLE: 'bg-purple-50 text-purple-800',
  SNM: 'bg-amber-50 text-amber-800',
  NXT: 'bg-green-50 text-green-800',
}

export default async function StatsPage() {
  const stats = await getStats()

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Statistiken</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Shows gesamt', value: stats.totalShows },
          { label: 'Ø Gesamt', value: stats.globalAvg?.toFixed(1) ?? '—' },
          { label: 'Ø PLEs', value: stats.pleAvg?.toFixed(1) ?? '—' },
          { label: 'Bewertungen', value: stats.totalRatings },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium text-gray-700 mb-3">Durchschnitt pro Person</h2>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 space-y-3">
        {stats.personStats.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-4">{i + 1}</span>
            <span className="text-sm flex-1">{p.name} <span className="text-xs text-gray-400">({p.count}x)</span></span>
            <div className="flex-[2] bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gray-800 rounded-full" style={{ width: `${Math.min((p.avg! / 10) * 100, 100)}%` }} />
            </div>
            <span className="text-sm font-medium text-gray-900 w-8 text-right">{p.avg!.toFixed(1)}</span>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium text-gray-700 mb-3">Top 5 Shows</h2>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 space-y-3">
        {stats.topShows.map((s, i) => {
          const dateStr = new Date(s.date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
          return (
            <div key={s.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-4">{i + 1}</span>
              <span className="text-sm flex-1">{s.title || s.type} <span className="text-xs text-gray-400">{dateStr}</span></span>
              <div className="flex-[2] bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gray-800 rounded-full" style={{ width: `${Math.min((s.avg! / 10) * 100, 100)}%` }} />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8 text-right">{s.avg!.toFixed(1)}</span>
            </div>
          )
        })}
      </div>

      <h2 className="text-sm font-medium text-gray-700 mb-3">Schnitt pro Show-Typ</h2>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
        {stats.typeStats.map(t => (
          <div key={t.type} className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${BADGE[t.type] || 'bg-gray-100 text-gray-700'}`}>{t.type}</span>
            <span className="text-xs text-gray-400 flex-1">{t.count} Shows</span>
            <div className="flex-[2] bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gray-800 rounded-full" style={{ width: `${Math.min((t.avg! / 10) * 100, 100)}%` }} />
            </div>
            <span className="text-sm font-medium text-gray-900 w-8 text-right">{t.avg!.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
