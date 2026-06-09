---
name: project-db-stack
description: DB-Zugriff via Supabase + postgres.js (lib/db.ts) — kein Neon, kein Prisma; POSTGRES_URL Pooler
metadata:
  type: project
---

Die DB ist **Supabase PostgreSQL**, angesprochen über **postgres.js**. Ältere
Hinweise auf Neon / `@neondatabase/serverless` / `DATABASE_URL` sind veraltet —
nicht darauf hören.

**Verbindung:**
- Einzige DB-Verbindung: `import sql from '@/lib/db'` — kein Prisma, kein Drizzle, kein zweiter Client
- Env-Var: `POSTGRES_URL` = Supabase-Pooler (Port 6543, `pgbouncer=true`), NICHT `channel_binding=require`
- `lib/db.ts` nutzt `max: 1` + Custom-DATE-Parser → DATE-Spalten bleiben `YYYY-MM-DD`-String (nicht in JS-Date casten!)
- Score beim Lesen mit `Number()` casten (kommt als String aus DECIMAL)

**Schema-Änderungen:**
- Nie ohne Rückfrage bei Jan ausführen
- Als `db/migrations/NNN_*.sql` ablegen (idempotent: `IF NOT EXISTS`, `ON CONFLICT`)
- `db/schema.sql` parallel mitpflegen (für Neuinstallationen)
- Siehe `db/migrations/README.md`

**Why:** Migration von Neon zu Supabase ist passiert; Doku in alten Agent-Defs
hinkt nach. Falscher Client/Connection-String = stille Fehler.

**How to apply:** Immer `sql` aus `lib/db.ts`. Neue Env-Vars/Migrationen mit Jan
abklären. Siehe [[project-db-schema]] und [[project-api-contracts]].
