---
name: project-shared-helpers
description: Zentrale Helfer & Komponenten — nicht lokal duplizieren (score, showStyle, ShowLogo, PersonRatingRow, ScoreRing)
metadata:
  type: project
---

Vor jeder UI-Arbeit: bestehende zentrale Helfer/Komponenten nutzen statt lokal
neu zu bauen. Frühere Duplikate (lokale `fmt`/`avg`/`SHOW_TYPES`) wurden bewusst
konsolidiert (WWE-024/030/031).

**Aus `lib/score.ts`:**
- `fmt(n)` — Score-Formatierung (immer ≥1 Dezimalstelle)
- `scoreColor(s)` — Tailwind-Textklasse (Single Source für Score-Farben)
- `scoreHex(s)` — gleiche Farbe als Hex (für SVG)
- `scoreLabel(s)` — inkl. ⚡-Prefix bei >10
- `avgScore(scores: number[])` — Mittel oder null

**Aus `lib/showStyle.ts`:**
- `SHOW_TYPES` (RAW/SmackDown/PLE/SNM) und `SHOW_FILTERS` (+ "Alle") — nie hartkodierte Typ-Arrays
- `BADGE`, `BORDER_ACCENT`, `TINT` (Record pro Typ)
- `getShowLogo(type, title, plePlaceholder?)`

**Komponenten:**
- `<ShowLogo type title heightClass badgeClass />` — Logo + automatischer Badge-Fallback + onError
- `<PersonRatingRow>` — einheitliche Rating-Zeile (Slider 0–10 Step 0.1 + DANHAUSEN-Bonus + Note); in Add/Edit/Detail identisch verwenden
- `<ScoreRing value size stroke />` — SVG-Gauge mit DANHAUSEN-Glow

**Why:** Verhindert auseinanderlaufende Score-Farben/Formatierung und doppelte
Wartungsstellen. Eine Änderung an der Logik soll an genau einer Stelle passieren.

**How to apply:** Importiere aus `@/lib/...` bzw. `@/app/components/...`. Wenn ein
Helfer fehlt, dort zentral ergänzen — nicht in der Page inline lösen. Siehe auch
[[project-dark-mode]] für die Farb-Tokens und [[project-danhausen-slider]].
