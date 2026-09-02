// lib/format.ts
// Zentrale Datums-Formatierung (de-DE) für ISO-Daten (YYYY-MM-DD).
// T12:00:00 verankert den Kalendertag in der Tagesmitte, damit er beim
// Rendern nicht durch Zeitzonen-Versatz kippt.

function atNoon(iso: string): Date {
  return new Date(iso + 'T12:00:00')
}

// "02.09.2026"
export function fmtDateFull(iso: string): string {
  return atNoon(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// "02.09."
export function fmtDateShort(iso: string): string {
  return atNoon(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

// Bausteine für die Datum-Pill im Kalender: { weekday: "Mi", day: "02", month: "Sep" }
export function dateParts(iso: string): { weekday: string; day: string; month: string } {
  const d = atNoon(iso)
  return {
    weekday: d.toLocaleDateString('de-DE', { weekday: 'short' }),
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('de-DE', { month: 'short' }),
  }
}
