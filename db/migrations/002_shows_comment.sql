-- Migration: Spitzname/Kommentar pro Show
-- Erlaubt Foffi/Jan/Björn/Curry, die Folge intern zu benennen
-- ("die Folge mit dem Stuhl-Match"), unabhängig vom offiziellen Titel.

ALTER TABLE shows
  ADD COLUMN IF NOT EXISTS comment VARCHAR(300) DEFAULT '';
