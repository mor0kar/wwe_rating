---
name: project-local-state-and-spoiler
description: localStorage-Hook-Pattern (identity, customEvents) + Spoiler-Schutz-Mechanik in Client-Wrappern
metadata:
  type: project
---

Gerätelokaler Client-State (kein Account-System — der PIN-Login schützt nach
außen). Etabliert in `lib/identity.ts` (WWE-025) und `lib/customEvents.ts` (WWE-034).

**localStorage-Hook-Pattern (immer so bauen):**
- `read()`/`write()` Helfer mit `typeof window === 'undefined'`-Guard (SSR-safe)
- Beim Schreiben ein Custom-`window`-Event dispatchen (z.B. `wwe-identity-change`)
  — `storage`-Events feuern nur cross-tab, nicht im selben Tab
- React-Hook hört auf Custom-Event **und** `storage`; gibt `{ …, ready }` zurück
- Vor `ready` Skeleton/Fallback rendern (vermeidet Hydration-Flackern)
- Für neue gerätelokale Features dieses Muster kopieren, nicht neu erfinden

**Spoiler-Schutz (WWE-025):**
- `useIdentity()` → `{ me, hideUntilRated, ready }`
- Aktiv wenn: `hideUntilRated` && `me` gesetzt && eigene Person hat noch nicht bewertet
- Dann fremde Bewertungen/ScoreRing verstecken, "Aufdecken"-Button als Fluchtweg
- Im Editor: nur die eigene Person zeigen; per POST (UPSERT) speichern, NICHT per
  PATCH (PATCH ersetzt alle Ratings → würde fremde löschen)
- **Server-Components dürfen `useIdentity` nicht nutzen** → in einen Client-Wrapper
  auslagern. Vorbilder: `app/shows/[id]/RatingsView.tsx` und `HeaderScore.tsx`

**Why:** Schützt User vor eigenen Spoilern, ohne Accounts/Login-Komplexität.
Custom-Events erlauben sofortiges Re-render im selben Tab.

**How to apply:** Neuen gerätelokalen State → eigenes `lib/<feature>.ts` nach dem
Hook-Muster. Spoiler-relevante Anzeigen immer hinter dem `useIdentity`-Gate +
Client-Wrapper. Siehe [[project-shared-helpers]].
