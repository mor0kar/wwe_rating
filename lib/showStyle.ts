// lib/showStyle.ts
// Zentrale visuelle Zuordnung pro Show-Typ: Logo, Badge, Akzent-Border, Tönung.

// Alle aktiv genutzten Show-Typen. Reihenfolge = UI-Reihenfolge in Auswahl/Filter.
export const SHOW_TYPES = ['RAW', 'SmackDown', 'PLE', 'SNM'] as const
export type ShowType = typeof SHOW_TYPES[number]

// Filter-Optionen für die /shows-Seite (alle Typen + "Alle"-Catch-all).
export const SHOW_FILTERS = ['Alle', ...SHOW_TYPES] as const

// --- Logos -------------------------------------------------------------
// Wöchentliche Shows haben ein festes Logo; PLEs werden anhand des Titels
// (z.B. "SummerSlam", "WrestleMania") auf das Franchise-Logo gemappt.
// Alle Logos werden direkt von Wikimedia/Wikipedia bzw. wwe.com geladen.

const WEEKLY_LOGOS: Record<string, string> = {
  RAW: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/WWE_RAW_Logo_2025.svg/3840px-WWE_RAW_Logo_2025.svg.png',
  SmackDown: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/WWE_SmackDown_%282024%29_Logo.svg/960px-WWE_SmackDown_%282024%29_Logo.svg.png',
  NXT: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/WWE_NXT_2024_Logo.svg/3840px-WWE_NXT_2024_Logo.svg.png',
  SNM: 'https://www.wwe.com/f/styles/wwe_large/public/all/2024/12/SNME-presale-reg-logo--5b3c37e662fa172d6cc9b7c74d699987--fa61ee9da3b54c8c4a052c2799aa0f87.png',
}

// PLE-Franchise-Logos. match = Suchbegriffe (lowercase), die im Titel vorkommen.
const PLE_LOGOS: { match: string[]; url: string }[] = [
  { match: ['wrestlemania'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Wrestlemania_Neutral_Logo.svg/500px-Wrestlemania_Neutral_Logo.svg.png' },
  { match: ['summerslam'], url: 'https://commons.wikimedia.org/wiki/Special:FilePath/SummerSlam%202025%20Logo.jpg?width=400' },
  { match: ['royal rumble'], url: 'https://en.wikipedia.org/wiki/Special:FilePath/Royal%20Rumble%20logo%20%282022%29.png?width=400' },
  { match: ['elimination chamber'], url: 'https://commons.wikimedia.org/wiki/Special:FilePath/WWE%20Elimination%20Chamber%20logo,%202015%20-%20present.png?width=400' },
  { match: ['money in the bank'], url: 'https://en.wikipedia.org/wiki/Special:FilePath/WWE%20Money%20In%20the%20Bank%20Logo.png?width=400' },
  { match: ['backlash'], url: 'https://en.wikipedia.org/wiki/Special:FilePath/WWE%20Backlash%202025%20logo.png?width=400' },
  { match: ['survivor series'], url: 'https://en.wikipedia.org/wiki/Special:FilePath/Survivor%20Series%202022%20logo.png?width=400' },
  { match: ['night of champions'], url: 'https://en.wikipedia.org/wiki/Special:FilePath/WWE%20Night%20of%20Champions%202023%20logo.png?width=400' },
]

// Generisches PLE-Bild als Fallback (statt Text-Badge), wenn kein spezifisches Logo passt.
// Überall die transparente "PREMIUM LIVE EVENT"-Wortmarke.
const PLE_EMBLEM = '/icons/ple-generic-wordmark-nobg.png'
const PLE_WORDMARK = '/icons/ple-generic-wordmark-nobg.png'

// Liefert die Logo-URL für eine Show. Unbekannte PLEs bekommen ein generisches
// PLE-Bild (plePlaceholder: 'emblem' = kompakt, 'wordmark' = groß, 'none' = Badge).
export function getShowLogo(
  type: string,
  title?: string,
  plePlaceholder: 'emblem' | 'wordmark' | 'none' = 'emblem',
): string | null {
  if (type === 'PLE') {
    const t = (title ?? '').toLowerCase()
    for (const ple of PLE_LOGOS) {
      if (ple.match.some(m => t.includes(m))) return ple.url
    }
    if (plePlaceholder === 'none') return null
    return plePlaceholder === 'wordmark' ? PLE_WORDMARK : PLE_EMBLEM
  }
  return WEEKLY_LOGOS[type] ?? null
}

// --- Typ-Styles --------------------------------------------------------

// Text-Badge (Fallback, wenn kein Logo)
export const BADGE: Record<string, string> = {
  RAW: 'bg-red-950 text-red-400',
  SmackDown: 'bg-blue-950 text-blue-400',
  PLE: 'bg-purple-950 text-purple-400',
  SNM: 'bg-amber-950 text-amber-400',
  NXT: 'bg-green-950 text-green-400',
}

// Linke Akzent-Border pro Typ
export const BORDER_ACCENT: Record<string, string> = {
  RAW: 'border-l-red-600',
  SmackDown: 'border-l-blue-600',
  PLE: 'border-l-purple-600',
  SNM: 'border-l-amber-500',
  NXT: 'border-l-green-600',
}

// Dezenter typ-getönter Verlauf (Scorecard-Look) — siehe globals.css
export const TINT: Record<string, string> = {
  RAW: 'card-tint-raw',
  SmackDown: 'card-tint-sd',
  PLE: 'card-tint-ple',
  SNM: 'card-tint-snm',
}
