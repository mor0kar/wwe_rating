---
name: project-api-contracts
description: Bestehende API-Routen, PATCH merged (nur Änderungen schicken); proxy.ts statt middleware.ts
metadata:
  type: project
---

Bestehende API-Contracts — nicht ohne Absprache brechen:

- `GET  /api/shows?type=all|RAW|SmackDown|PLE|SNM` → `Show[]` mit eingebetteten `ratings` (Record) + `notes` (Record)
- `POST /api/shows` → `{ type, date, title?, comment?, ratings, notes? }` → legt Show + alle Ratings an.
  Existiert schon eine Show mit gleichem Typ + Datum, wird sie **ergänzt** (`ON CONFLICT DO NOTHING`,
  Advisory-Lock gegen Doppel-Shows) → Antwort `{ ok, id, merged }`
- `PATCH /api/shows/[id]` → `{ type?, date?, title?, comment?, ratings?, notes?, moments?, removed? }` →
  **Merge**: nur mitgeschickte Felder/Personen werden geändert (Upsert), `removed` löscht gezielt.
  Antwort `{ ok, show }` mit aktuellem Stand inkl. aller Ratings
- `POST /api/shows/[id]` → `{ person, score, note? }` → **UPSERT für EINE Person** (`ON CONFLICT DO UPDATE`)
- `DELETE /api/shows/[id]` → löscht Show (Ratings via CASCADE)
- `GET/POST/DELETE /api/persons`
- `POST /api/auth` → `{ pin }` → setzt httpOnly-Cookie mit HMAC-Token (nicht den PIN); 429 nach 10 Fehlversuchen/IP
- `GET /api/cron/discord` → via `CRON_SECRET` geschützt (`?test=1` zum Verifizieren)
- `GET /api/export` → CSV/JSON Datenexport (WWE-028)

**Nur Änderungen schicken (wichtig):**
Früher hat PATCH alle Ratings gelöscht und den Client-Stand neu eingefügt. Waren
zwei Leute gleichzeitig auf der Seite, hat der veraltete Stand des einen die
Bewertung des anderen gelöscht/überschrieben (Bug, behoben Nov 2026). Clients
(`RatingEditor`, `EditCard`) schicken deshalb nur geänderte Personen/Felder.

**Auth:**
- `proxy.ts` (ex `middleware.ts`, umbenannt für Next.js 16) schützt alle Routen
  außer `/login`, `/api/auth`, `/api/cron`
- PIN nie loggen / nie in Response zurückgeben

**Why:** Delete-and-reinsert mit Client-Snapshot ist bei parallelen Nutzern eine echte Datenverlust-Falle.

**How to apply:** Nie wieder "alles ersetzen" mit Client-Stand — immer nur Diffs schicken
und serverseitig upserten. Neue geschützte Route
ggf. zur PUBLIC_PATHS-Logik in `proxy.ts` passend einordnen. Siehe
[[project-db-stack]], [[project-db-schema]].
