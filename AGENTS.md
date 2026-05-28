# AGENTS.md — wwe-rater

Root-Vertrag für alle Agents und AI-gestützten Sessions in diesem Repository.
Jeder Agent, jede Session und jede größere Änderung behandelt diese Datei als zentrale Projektregel.

---

## Projektbeschreibung

**wwe-rater** ist eine private Web-App für Jan und seine Freunde (Foffi, Björn, Curry) zum Bewerten von WWE-Shows (RAW, SmackDown, PLE, SNM, NXT). Ersetzt die bisherige Excel/Google-Sheets-Lösung. PIN-geschützt, mobil-first, hosted auf Vercel.

Scores gehen von 0–10, mit optionalem Overflow bis 15 für legendäre Shows (intern "DANHAUSEN-Skala").

---

## Quellen der Wahrheit

Jeder Agent liest vor produktiver Arbeit in dieser Reihenfolge:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `TODOS.md`
4. `.ai/agent-memory.md`
5. Relevante Dateien im aktuellen Scope

---

## Nicht verhandelbare Projektregeln

- Keine externen Libraries ohne explizite Freigabe durch Jan
- Kein Prisma — Neon direkt via `@neondatabase/serverless`
- `DATABASE_URL` immer Pooler-URL mit `pgbouncer=true&connect_timeout=15` — nie `channel_binding=require`
- Kein NextAuth — PIN-Auth via httpOnly Cookie reicht
- PIN wird niemals geloggt oder in Responses zurückgegeben
- Score-Range: 0–15 (Slider), in DB als DECIMAL(4,2) speichern
- Alle Shows und Ratings kommen aus der Datenbank — kein hardcoding
- `db/seed.js` ist einmalig — nie ein zweites Mal ausführen (Duplikat-Schutz via ON CONFLICT vorhanden, aber trotzdem)
- Keine neuen Dependencies ohne Rückfrage

---

## Arbeitsprinzipien

- Kleine, sichere Änderungen vor großen Umbauten
- Bestehende Patterns bevorzugen (Tailwind v4, App Router, Server Components wo möglich)
- Keine unnötige Komplexität — die App soll simpel bleiben
- Mobile-first: UI muss auf dem Handy gut funktionieren

---

## Iterationsschema

1. **Verstehen** — was soll geändert werden und warum?
2. **Planen** — welche Dateien sind betroffen?
3. **Minimal umsetzen** — kleinster sinnvoller Schritt
4. **Prüfen** — `npm run build` muss grün sein
5. **Dokumentieren** — `TODOS.md` + `CLAUDE.md` aktualisieren wenn nötig
6. **Erst dann erweitern**

---

## Definition of Done

Ein Task gilt als done, wenn:

- [ ] Die Änderung zum Projektziel passt
- [ ] `npm run build` läuft ohne Fehler durch
- [ ] UI ist auf Mobile nutzbar (max-w-lg, touch-friendly)
- [ ] Keine neuen Dependencies ohne Rückfrage eingeführt
- [ ] `TODOS.md` aktualisiert wurde
- [ ] Kein Scope-Creep stattfand

---

## Agenten und Verantwortungen

### orchestrator
Verantwortlich für:
- Task-Auswahl aus `TODOS.md`
- Delegation an Spezial-Agenten
- Qualitätssicherung nach jeder Iteration

### planner
Verantwortlich für:
- Zerlegung großer Tasks in Teilaufgaben
- Abhängigkeiten und Akzeptanzkriterien definieren
- Keine Code-Änderungen — nur Planung und `TODOS.md`

### implementer
Verantwortlich für:
- Fokussierte Umsetzung eines einzelnen Tasks
- Minimale, saubere Änderungen
- Validierung via `npm run build` nach jeder Änderung

### frontend-specialist
Verantwortlich für:
- UI-Komponenten und Seiten (`app/**/*.tsx`)
- Mobile-first Layout, Tailwind v4 Styling
- Interaktivität (Client Components mit `'use client'`)
- Score-Visualisierung, Filter, Animationen

### backend-specialist
Verantwortlich für:
- API-Routen (`app/api/**`)
- Datenbankabfragen (`lib/db.ts`)
- Auth-Logik (`lib/auth.ts`, `middleware.ts`)
- Schema-Änderungen (`db/schema.sql`)

### session-handoff
Verantwortlich für:
- Saubere Übergaben zwischen Sessions
- Stand, Risiken und nächste Schritte dokumentieren

### prompt-optimizer
Verantwortlich für:
- Konsistenz zwischen `AGENTS.md`, `CLAUDE.md` und allen Agents prüfen
- Veraltete Referenzen und Widersprüche identifizieren

---

## Technischer Rahmen

- Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Neon PostgreSQL
- Build: `npm run build`
- Dev: `npm run dev` → http://localhost:3000
- Deployment: Vercel

---

## Hooks

Nach jeder Änderung:
- `npm run build` — TypeScript + Build muss grün sein
- Manuell im Browser prüfen: Mobile-Ansicht, PIN-Login, Show hinzufügen
