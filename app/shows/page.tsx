'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Show = {
  id: number
  type: string
  date: string
  title: string
  ratings: Record<string, number>
}

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

function avg(ratings: Record<string, number>) {
  const vals = Object.values(ratings).filter(v => v != null)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

const FILTERS = ['Alle', 'RAW', 'SmackDown', 'PLE', 'SNM', 'NXT']

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([])
  const [filter, setFilter] = useState('Alle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const type = filter === 'Alle' ? 'all' : filter
    fetch(`/api/shows?type=${type}`)
      .then(r => r.json())
      .then(data => { setShows(data); setLoading(false) })
  }, [filter])

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">WWE Rater</h1>
          <p className="text-sm text-gray-400">{shows.length} Shows</p>
        </div>
        <div className="flex gap-2">
          <Link href="/stats" className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600">
            Stats
          </Link>
          <Link href="/shows/add" className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-lg">
            + Neu
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-400 py-12 text-sm">Lädt...</p>}

      <div className="space-y-3">
        {shows.map(show => {
          const a = avg(show.ratings)
          const dateStr = new Date(show.date + 'T12:00:00').toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          })
          const persons = Object.keys(show.ratings)
          return (
            <div key={show.id} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${BADGE[show.type] || 'bg-gray-100 text-gray-700'}`}>
                      {show.type}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {show.title || show.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{dateStr}</p>
                </div>
                {a !== null && (
                  <div className="text-right shrink-0">
                    <span className="text-lg font-semibold text-gray-900">{a.toFixed(1)}</span>
                    <p className="text-xs text-gray-400">Schnitt</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {persons.map(p => (
                  <div key={p} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1">
                    <span className="text-xs text-gray-500">{p}</span>
                    <span className={`text-sm font-medium ${scoreColor(show.ratings[p])}`}>
                      {show.ratings[p] > 10 ? `⚡${show.ratings[p]}` : show.ratings[p]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
