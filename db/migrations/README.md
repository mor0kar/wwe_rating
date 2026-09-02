# Migrations

Nachträgliche Schema-Änderungen. Wird per Hand im Supabase SQL Editor
ausgeführt — kein Migration-Runner.

## Konvention

`NNN_kurzbeschreibung.sql` — laufende dreistellige Nummer.
Numerierung beginnt mit `002`, weil `001` implizit `db/schema.sql` ist
(initiales Schema, das einmalig beim Aufsetzen der DB läuft).

## Vorgehen bei neuer Migration

1. Datei `NNN_xxx.sql` anlegen (idempotent schreiben — `IF NOT EXISTS`,
   `ON CONFLICT DO NOTHING` etc.)
2. `db/schema.sql` parallel aktualisieren (damit Neuinstallationen sofort
   das vollständige Schema bekommen)
3. Im Supabase SQL Editor ausführen
4. Vercel-Deploy triggern, falls App-Code mitgeändert wurde

## Existierende Migrations

- [`002_shows_comment.sql`](002_shows_comment.sql) — neue Spalte `shows.comment`
  für interne Spitznamen ("Die Stuhl-Match-Folge")
- [`003_ratings_moment.sql`](003_ratings_moment.sql) — neue Spalte `ratings.moment`
  ('up' = ⚡ Holy Shit!, 'down' = 👎 Heat); Backfill: bestehende Wertungen mit
  Begründung → 'up'. Ausgeführt 2026-09-02 via Supabase MCP.
