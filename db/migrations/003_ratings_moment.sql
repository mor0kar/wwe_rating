-- 003: Besondere Momente mit Richtung.
-- 'up'   = ⚡ Holy Shit!-Moment (Bonus, lila) — hieß vorher DANHAUSEN
-- 'down' = 👎 Heat (Malus, rot)
-- NULL   = normale Wertung ohne besonderen Moment.
-- Backfill: alle bisherigen Wertungen mit Begründung (note) waren DANHAUSEN → 'up'.
-- Ausgeführt am 2026-09-02 via Supabase MCP (apply_migration: add_ratings_moment).

ALTER TABLE ratings ADD COLUMN IF NOT EXISTS moment TEXT CHECK (moment IN ('up','down'));
UPDATE ratings SET moment = 'up' WHERE note IS NOT NULL AND moment IS NULL;
