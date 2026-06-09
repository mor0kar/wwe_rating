'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fmt, scoreColor, scoreHex } from '@/lib/score'
import { getShowLogo, BADGE } from '@/lib/showStyle'

export type TimelinePoint = {
  id: number
  date: string
  type: string
  title: string
  avg: number
}

// Interaktiver SVG-Verlaufschart: Hover zeigt Tooltip, Klick öffnet die Show.
export default function ScoreTimeline({
  data,
  globalAvg,
}: {
  data: TimelinePoint[]
  globalAvg: number | null
}) {
  const router = useRouter()
  const [hover, setHover] = useState<number | null>(null)

  if (data.length < 2) return null

  const W = 720, H = 240
  const padL = 30, padR = 14, padT = 16, padB = 30
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const yMax = Math.max(10, Math.ceil(Math.max(...data.map(d => d.avg))))
  const xAt = (i: number) => padL + (i / (data.length - 1)) * innerW
  const yAt = (v: number) => padT + innerH - (Math.min(v, yMax) / yMax) * innerH

  const linePts = data.map((d, i) => `${xAt(i).toFixed(1)},${yAt(d.avg).toFixed(1)}`).join(' ')
  const areaPath =
    `M ${xAt(0).toFixed(1)},${yAt(0).toFixed(1)} ` +
    data.map((d, i) => `L ${xAt(i).toFixed(1)},${yAt(d.avg).toFixed(1)}`).join(' ') +
    ` L ${xAt(data.length - 1).toFixed(1)},${yAt(0).toFixed(1)} Z`

  const yTicks = Array.from(new Set([0, 5, 10, yMax])).filter(v => v <= yMax)
  const lastIdx = data.length - 1
  const xIdx = Array.from(new Set([0, Math.floor(lastIdx / 3), Math.floor((2 * lastIdx) / 3), lastIdx]))
  const fmtDate = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })

  const active = hover != null ? data[hover] : null
  const logo = active ? getShowLogo(active.type, active.title) : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Score-Verlauf der Saison">
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gridlines + Y-Beschriftung */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={padL} y1={yAt(v)} x2={W - padR} y2={yAt(v)} stroke="#27272a" strokeWidth="1" />
            <text x={padL - 6} y={yAt(v) + 4} textAnchor="end" fontSize="12" fill="#71717a">{v}</text>
          </g>
        ))}

        {/* Gesamtschnitt als gestrichelte Referenz */}
        {globalAvg != null && (
          <line
            x1={padL} y1={yAt(globalAvg)} x2={W - padR} y2={yAt(globalAvg)}
            stroke="#52525b" strokeWidth="1" strokeDasharray="4 4"
          />
        )}

        {/* Fläche + Linie */}
        <path d={areaPath} fill="url(#scoreFill)" />
        <polyline
          points={linePts} fill="none" stroke="#ef4444" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round"
        />

        {/* Vertikale Hover-Markierung */}
        {active && hover != null && (
          <line
            x1={xAt(hover)} y1={padT} x2={xAt(hover)} y2={padT + innerH}
            stroke="#52525b" strokeWidth="1" strokeDasharray="3 3"
          />
        )}

        {/* Sichtbare Punkte (rein visuell — Interaktion läuft über die Slices darüber) */}
        {data.map((d, i) => (
          <circle
            key={`dot-${i}`}
            cx={xAt(i)}
            cy={yAt(d.avg)}
            r={hover === i ? 5 : 2.5}
            fill={scoreHex(d.avg)}
            stroke={hover === i ? '#fafafa' : 'none'}
            strokeWidth={hover === i ? 1.5 : 0}
            className="transition-all pointer-events-none"
          />
        ))}

        {/* Interaktions-Slices: volle Höhe je Punkt → große Tap-Fläche; Klick öffnet die Show */}
        {data.map((d, i) => {
          const left = i === 0 ? padL : (xAt(i - 1) + xAt(i)) / 2
          const right = i === lastIdx ? W - padR : (xAt(i) + xAt(i + 1)) / 2
          return (
            <rect
              key={`hit-${i}`}
              x={left}
              y={padT}
              width={Math.max(0, right - left)}
              height={innerH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(h => (h === i ? null : h))}
              onClick={() => router.push(`/shows/${d.id}`)}
            >
              <title>{`${d.title || d.type} öffnen`}</title>
            </rect>
          )
        })}

        {/* X-Beschriftung (Datum) */}
        {xIdx.map(i => (
          <text
            key={i}
            x={xAt(i)}
            y={H - 10}
            textAnchor={i === 0 ? 'start' : i === lastIdx ? 'end' : 'middle'}
            fontSize="12"
            fill="#71717a"
          >
            {fmtDate(data[i].date)}
          </text>
        ))}
      </svg>

      <p className="mt-2 text-center text-[11px] text-zinc-600">
        Tipp: Auf einen Punkt tippen öffnet die Show
      </p>

      {/* Tooltip */}
      {active && hover != null && (
        <div
          className="absolute z-10 pointer-events-none -translate-x-1/2 -translate-y-[130%] bg-zinc-950/95 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm whitespace-nowrap"
          style={{ left: `${(xAt(hover) / W) * 100}%`, top: `${(yAt(active.avg) / H) * 100}%` }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {logo ? (
              <img src={logo} alt={active.type} className="h-3.5 object-contain" />
            ) : (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${BADGE[active.type] || 'bg-zinc-800 text-zinc-300'}`}>
                {active.type}
              </span>
            )}
            <span className="text-xs font-medium text-zinc-100">{active.title || active.type}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-zinc-500">{fmtDate(active.date)}</span>
            <span className={`text-sm font-heading font-bold tabular-nums ${scoreColor(active.avg)}`}>
              {active.avg > 10 ? `⚡${fmt(active.avg)}` : fmt(active.avg)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
