// lib/score.ts
// Zentrale Helfer für Score-Formatierung und -Farben.
// Overflow-Skala: >10 ist legendär (lila), <0 ist Vollkatastrophe (rot),
// dazwischen grün/amber/rot nach Schwellen.

// Besondere Momente mit Begründung:
// 'up'   = ⚡ Holy Shit!-Moment (Bonus 0–5, lila) — hieß früher DANHAUSEN
// 'down' = 👎 Heat (Malus 0–5, rot)
export type Moment = 'up' | 'down'

// Anzeige-Metadaten pro Moment-Richtung — eine Quelle für Icon + Namen.
export const MOMENT_META: Record<Moment, { icon: string; label: string }> = {
  up: { icon: '⚡', label: 'Holy Shit!-Moment' },
  down: { icon: '👎', label: 'Heat' },
}

// Zahl auf max. 2 Nachkommastellen, immer mit mind. einer Dezimalstelle.
export function fmt(n: number): string {
  const s = parseFloat(n.toFixed(2)).toString()
  return s.includes('.') ? s : s + '.0'
}

// Tailwind-Textklasse für einen Score.
export function scoreColor(s: number): string {
  if (s > 10) return 'text-purple-400 font-bold'
  if (s < 0) return 'text-red-500 font-bold'
  if (s >= 7) return 'text-green-400'
  if (s >= 4) return 'text-amber-500'
  return 'text-red-400'
}

// Score-Farbe als Hex (für SVG-fill etc.) — passend zu scoreColor.
export function scoreHex(s: number): string {
  if (s > 10) return '#c084fc' // purple-400
  if (s < 0) return '#ef4444' // red-500
  if (s >= 7) return '#4ade80' // green-400
  if (s >= 4) return '#f59e0b' // amber-500
  return '#f87171' // red-400
}

// Score-Label inkl. Overflow-Symbol (⚡ über 10, 👎 unter 0).
export function scoreLabel(s: number): string {
  if (s > 10) return `⚡${fmt(s)}`
  if (s < 0) return `👎${fmt(s)}`
  return fmt(s)
}

// Textfarbe unter Berücksichtigung des Moments: up lila, down rot,
// sonst normale Score-Schwellen.
export function momentColor(moment: Moment | null | undefined, s: number): string {
  if (moment === 'up') return 'text-purple-400 font-bold'
  if (moment === 'down') return 'text-red-500 font-bold'
  return scoreColor(s)
}

// Label mit Moment-Icon (⚡/👎) vor dem Wert; ohne Moment normales Label.
export function momentLabel(moment: Moment | null | undefined, s: number): string {
  if (moment === 'up') return `⚡${fmt(s)}`
  if (moment === 'down') return `👎${fmt(s)}`
  return scoreLabel(s)
}

// Arithmetisches Mittel einer Score-Liste. null wenn leer.
export function avgScore(scores: number[]): number | null {
  const valid = scores.filter(v => v != null && !isNaN(v))
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}
