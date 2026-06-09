---
name: project-api-contracts
description: Bestehende API-Routen + PATCH-vs-POST-Falle bei Ratings; proxy.ts statt middleware.ts
metadata:
  type: project
---

Bestehende API-Contracts — nicht ohne Absprache brechen:

- `GET  /api/shows?type=all|RAW|SmackDown|PLE|SNM` → `Show[]` mit eingebetteten `ratings` (Record) + `notes` (Record)
- `POST /api/shows` → `{ type, date, title?, comment?, ratings, notes? }` → legt Show + alle Ratings an
- `PATCH /api/shows/[id]` → `{ type, date, title?, comment?, ratings, notes? }` → **löscht ALLE Ratings der Show und legt sie neu an**
- `POST /api/shows/[id]` → `{ person, score, note? }` → **UPSERT für EINE Person** (`ON CONFLICT DO UPDATE`)
- `DELETE /api/shows/[id]` → löscht Show (Ratings via CASCADE)
- `GET/POST/DELETE /api/persons`
- `POST /api/auth` → `{ pin }` → setzt httpOnly-Cookie
- `GET /api/cron/discord` → via `CRON_SECRET` geschützt (`?test=1` zum Verifizieren)
- `GET /api/export` → CSV/JSON Datenexport (WWE-028)

**PATCH-vs-POST-Falle (wichtig):**
PATCH ersetzt **alle** Ratings einer Show. Wenn nur das Rating einer Person
gespeichert werden soll (z.B. Spoiler-Modus, wo man fremde Werte nicht kennt),
**POST /api/shows/[id]** nutzen — sonst werden die anderen gelöscht.

**Auth:**
- `proxy.ts` (ex `middleware.ts`, umbenannt für Next.js 16) schützt alle Routen
  außer `/login`, `/api/auth`, `/api/cron`
- PIN nie loggen / nie in Response zurückgeben

**Why:** Der PATCH-Delete-and-reinsert ist eine echte Datenverlust-Falle.

**How to apply:** Einzel-Rating → POST. Voll-Edit → PATCH. Neue geschützte Route
ggf. zur PUBLIC_PATHS-Logik in `proxy.ts` passend einordnen. Siehe
[[project-db-stack]], [[project-db-schema]].
