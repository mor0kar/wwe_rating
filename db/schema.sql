-- WWE Rater Schema
-- Run this in your Neon console or via psql

CREATE TABLE IF NOT EXISTS persons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shows (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('RAW','SmackDown','PLE','SNM','NXT')),
  date DATE NOT NULL,
  title VARCHAR(200) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  person_name VARCHAR(100) NOT NULL,
  score DECIMAL(4,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(show_id, person_name)
);

-- Seed: Personen
INSERT INTO persons (name) VALUES ('Foffi'), ('Jan'), ('Björn'), ('Curry')
ON CONFLICT (name) DO NOTHING;
