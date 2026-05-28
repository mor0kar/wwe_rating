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

  return {
    globalAvg,
    pleAvg: avg(pleScores),
    totalShows: shows.length,
    totalRatings: allScores.length,
    personStats,
    topShows: showAvgs.slice(0, 5),
    flopShows: [...showAvgs].reverse().slice(0, 3),
    typeStats,
  }
}

const BADGE: Record<string, string> = {
  RAW: 'bg-red-950 text-red-400',
  SmackDown: 'bg-blue-950 text-blue-400',
  PLE: 'bg-purple-950 text-purple-400',
  SNM: 'bg-amber-950 text-amber-400',
  NXT: 'bg-green-950 text-green-400',
}

const LOGOS: Record<string, string> = {
  RAW: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/WWE_RAW_Logo_2025.svg/3840px-WWE_RAW_Logo_2025.svg.png',
  SmackDown: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/WWE_SmackDown_%282024%29_Logo.svg/960px-WWE_SmackDown_%282024%29_Logo.svg.png',
  NXT: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/WWE_NXT_2024_Logo.svg/3840px-WWE_NXT_2024_Logo.svg.png',
  SNM: 'https://www.wwe.com/f/styles/wwe_large/public/all/2024/12/SNME-presale-reg-logo--5b3c37e662fa172d6cc9b7c74d699987--fa61ee9da3b54c8c4a052c2799aa0f87.png',
}

function showTypeBadge(type: string, className = 'h-4') {
  if (LOGOS[type]) {
    return <img src={LOGOS[type]} alt={type} className={`${className} object-contain shrink-0`} loading="lazy" />
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

function scoreColor(s: number) {
  if (s > 10) return 'text-purple-400 font-bold'
  if (s >= 7) return 'text-green-400'
  if (s >= 4) return 'text-amber-500'
  return 'text-red-400'
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
      <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 mb-8">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
          <p className="text-red-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Season Rankings</p>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">Hall of Fame</h1>
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
              <p className={`text-3xl font-bold ${s.isScore && s.score != null ? scoreColor(s.score) : 'text-zinc-50'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

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
                          {showTypeBadge(s.type, 'h-3.5')}
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
                          {showTypeBadge(s.type, 'h-3.5')}
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
