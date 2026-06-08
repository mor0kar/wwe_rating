// lib/score.ts
// Zentrale Helfer für Score-Formatierung und -Farben.
// DANHAUSEN-Skala: >10 ist legendär (lila), darunter grün/amber/rot.

// Zahl auf max. 2 Nachkommastellen, immer mit mind. einer Dezimalstelle.
export function fmt(n: number): string {
  const s = parseFloat(n.toFixed(2)).toString()
  return s.includes('.') ? s : s + '.0'
}

// Tailwind-Textklasse für einen Score.
export function scoreColor(s: number): string {
  if (s > 10) return 'text-purple-400 font-bold'
  if (s >= 7) return 'text-green-400'
  if (s >= 4) return 'text-amber-500'
  return 'text-red-400'
}

// Score-Farbe als Hex (für SVG-fill etc.) — passend zu scoreColor.
export function scoreHex(s: number): string {
  if (s > 10) return '#c084fc' // purple-400
  if (s >= 7) return '#4ade80' // green-400
  if (s >= 4) return '#f59e0b' // amber-500
  return '#f87171' // red-400
}

// Score-Label inkl. DANHAUSEN-Blitz für Werte >10.
export function scoreLabel(s: number): string {
  return s > 10 ? `⚡${fmt(s)}` : fmt(s)
}

// Arithmetisches Mittel einer Score-Liste. null wenn leer.
export function avgScore(scores: number[]): number | null {
  const valid = scores.filter(v => v != null && !isNaN(v))
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}
