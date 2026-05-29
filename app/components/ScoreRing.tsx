// Score als Ring-Gauge (reines SVG). Funktioniert in Server- & Client-Components.
// Ring füllt sich bis 10; Scores >10 (DANHAUSEN) füllen voll + Lila-Glow.

function fmt(n: number): string {
  const s = parseFloat(n.toFixed(2)).toString()
  return s.includes('.') ? s : s + '.0'
}

function scoreHex(s: number) {
  if (s > 10) return '#c084fc'
  if (s >= 7) return '#4ade80'
  if (s >= 4) return '#fbbf24'
  return '#f87171'
}

export default function ScoreRing({
  value,
  size = 56,
  stroke = 4,
}: {
  value: number
  size?: number
  stroke?: number
}) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(value, 10)) / 10
  const offset = circumference * (1 - frac)
  const color = scoreHex(value)
  const danhausen = value > 10
  const fontSize = size * 0.32

  return (
    <div
      className={`relative shrink-0 ${danhausen ? 'drop-shadow-[0_0_10px_rgba(192,132,252,0.55)]' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-heading font-bold leading-none tabular-nums"
          style={{ fontSize, color }}
        >
          {fmt(value)}
        </span>
      </div>
    </div>
  )
}
