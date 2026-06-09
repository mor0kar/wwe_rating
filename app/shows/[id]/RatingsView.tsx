'use client'
import { useState } from 'react'
import { scoreColor, scoreLabel, avgScore } from '@/lib/score'
import { useIdentity } from '@/lib/identity'

type RatingRow = { person_name: string; score: number; note: string | null }

export default function RatingsView({ ratings }: { ratings: RatingRow[] }) {
  const { me, hideUntilRated } = useIdentity()
  const [revealed, setRevealed] = useState(false)

  const myScore = me ? ratings.find(r => r.person_name === me) : undefined
  const spoilerActive =
    hideUntilRated && !!me && !myScore && ratings.length > 0 && !revealed

  if (ratings.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
        <p className="text-sm text-zinc-500">Keine Bewertungen vorhanden.</p>
      </div>
    )
  }

  // Stats-Werte (nur wenn nicht im Spoiler-Modus angezeigt)
  const scores = ratings.map(r => Number(r.score))
  const avg = avgScore(scores)
  const spread = scores.length >= 2 ? Math.max(...scores) - Math.min(...scores) : null
  const highest = ratings.reduce((best, r) => Number(r.score) >= Number(best.score) ? r : best)
  const lowest = ratings.reduce((worst, r) => Number(r.score) <= Number(worst.score) ? r : worst)

  if (spoilerActive) {
    return (
      <>
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Bewertungen</h2>
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-6 mb-4 text-center">
          <p className="text-3xl mb-2">👁</p>
          <p className="text-sm font-medium text-zinc-200">Bewertungen versteckt</p>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Du hast diese Show noch nicht bewertet. Bewerte unten oder decke auf.
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="text-xs uppercase tracking-wider font-bold border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl transition-colors"
          >
            Trotzdem aufdecken
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <h2 className="text-sm font-medium text-zinc-400 mb-3">Bewertungen</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 space-y-3">
        {ratings.map(r => {
          const score = Number(r.score)
          const isDanhausen = !!(r.note && r.note.trim() !== '')
          const isMe = me === r.person_name
          return (
            <div key={r.person_name}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-100">
                  {r.person_name}
                  {isMe && <span className="text-xs text-zinc-500 ml-1.5">(du)</span>}
                </span>
                <span className={`text-base font-semibold ${isDanhausen ? 'text-purple-400 font-bold' : scoreColor(score)}`}>
                  {isDanhausen ? `⚡${scoreLabel(score).replace('⚡', '')}` : scoreLabel(score)}
                </span>
              </div>
              {isDanhausen && (
                <p className="text-xs text-purple-300 italic mt-0.5">⚡ {r.note}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Statistik-Cards */}
      <h2 className="text-sm font-medium text-zinc-400 mb-3">Auswertung</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Ø Durchschnitt</p>
          <p className={`text-2xl font-semibold ${avg !== null ? scoreColor(avg) : 'text-zinc-50'}`}>
            {avg !== null ? avg.toFixed(1) : '—'}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Spanne</p>
          <p className="text-2xl font-semibold text-zinc-50">
            {spread !== null ? `Δ${spread.toFixed(1)}` : '—'}
          </p>
        </div>
      </div>

      {highest.person_name !== lowest.person_name && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Höchste Bewertung</span>
            <span className="text-sm text-zinc-100">
              {highest.person_name}{' '}
              <span className={`font-semibold ${scoreColor(Number(highest.score))}`}>
                {scoreLabel(Number(highest.score))}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Niedrigste Bewertung</span>
            <span className="text-sm text-zinc-100">
              {lowest.person_name}{' '}
              <span className={`font-semibold ${scoreColor(Number(lowest.score))}`}>
                {scoreLabel(Number(lowest.score))}
              </span>
            </span>
          </div>
        </div>
      )}
    </>
  )
}
