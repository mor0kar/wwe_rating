'use client'
import { useState } from 'react'
import ScoreRing from '@/app/components/ScoreRing'
import { useIdentity } from '@/lib/identity'

type Props = {
  avg: number
  // Personen mit Bewertung — um zu prüfen, ob "ich" schon bewertet habe
  ratedBy: string[]
}

export default function HeaderScore({ avg, ratedBy }: Props) {
  const { me, hideUntilRated } = useIdentity()
  const [revealed, setRevealed] = useState(false)
  const iRated = me ? ratedBy.includes(me) : false
  const spoilerActive = hideUntilRated && !!me && !iRated && !revealed

  if (spoilerActive) {
    return (
      <button
        onClick={() => setRevealed(true)}
        className="w-[76px] h-[76px] rounded-full bg-zinc-800/60 border border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 transition-colors"
        aria-label="Schnitt aufdecken"
      >
        <span className="text-zinc-500 text-2xl">👁</span>
      </button>
    )
  }

  return <ScoreRing value={avg} size={76} stroke={5} />
}
