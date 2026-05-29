# CLAUDE.md — wwe-rater

Dieses Dokument ist der Projektkontext für Claude Code.
Vor jeder Arbeit im Repo lesen und einhalten.

---

## Projektübersicht

**wwe-rater** ist eine private Web-App für Jan und seine Freunde (Foffi, Björn, Curry) zum Bewerten von WWE-Shows. Ersetzt die bisherige Excel-Tabelle. Scores gehen von 0–10, mit Overflow bis 15 für legendäre Momente (DANHAUSEN-Skala).

**Live:** https://wwe-rater.vercel.app (nach Deployment)
**Repo:** https://github.com/mor0kar/wwe_rating

---

## Tech Stack

| Was | Womit |
|---|---|
| Framework | Next.js 15 (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS v4 |
| Datenbank | Supabase PostgreSQL (direkt, kein Prisma) |
| Auth | PIN via httpOnly Cookie (kein NextAuth) |
| Deployment | Vercel (Free Tier) |

---

## Projektstruktur

```
wwe-rater/
├── app/
│   ├── api/
│   │   ├── auth/route.ts        ← PIN-Login Endpoint
│   │   ├── shows/route.ts       ← Shows GET + POST
│   │   └── persons/route.ts     ← Personen GET/POST/DELETE
│   ├── login/page.tsx           ← PIN-Eingabe (public)
│   ├── shows/
│   │   ├── page.tsx             ← Show-Liste (Client Component)
│   │   └── add/page.tsx         ← Neue Show erfassen
│   ├── stats/page.tsx           ← Statistiken (Server Component)
│   ├── layout.tsx
│   ├── page.tsx                 ← Redirect → /shows
│   └── globals.css
├── lib/
│   ├── db.ts                    ← Neon SQL Client (einzige DB-Verbindung)
│   └── auth.ts                  ← PIN-Konstanten, checkPin()
├── middleware.ts                 ← PIN-Schutz für alle Routen
├── db/
│   ├── schema.sql               ← DB-Schema (in Neon SQL Editor ausführen)
│   └── seed.js                  ← Einmaliger Import der 48 Excel-Shows
└── .claude/
    └── agents/                  ← orchestrator, planner, implementer,
                                    frontend-specialist, backend-specialist,
                                    session-handoff, prompt-optimizer
```

---

## Design System

Mobile-first, max-w-lg, sauber und lesbar.

Farben/Tokens:
- Hintergrund: `bg-gray-50`
- Cards: `bg-white border border-gray-100 rounded-2xl`
- Buttons: `bg-gray-900 text-white rounded-xl`
- Inputs: `border border-gray-200 rounded-xl`

Show-Typ Badges:
- RAW → `bg-red-50 text-red-800`
- SmackDown → `bg-blue-50 text-blue-800`
- PLE → `bg-purple-50 text-purple-800`
- SNM → `bg-amber-50 text-amber-800`
- NXT → `bg-green-50 text-green-800`

Score-Farben:
- `>10` → `text-purple-600 font-bold` (DANHAUSEN-Skala, ⚡-Prefix)
- `≥7` → `text-green-600`
- `≥4` → `text-amber-600`
- `<4` → `text-red-500`

Fonts:
- Headlines/Wordmark/Scores: **Oswald** (athletic/condensed) via `next/font/google`, geladen in `app/layout.tsx`, als CSS-Var `--font-oswald` → Theme-Token `--font-heading` (Utility `font-heading`). h1/h2/h3 nutzen sie automatisch (`@layer base` in `globals.css`).
- Body/UI: System-Font-Stack.

---

## Datenbank-Schema

```sql
persons (id SERIAL PK, name VARCHAR(100) UNIQUE)
shows   (id SERIAL PK, type VARCHAR(20) CHECK IN ('RAW','SmackDown','PLE','SNM','NXT'),
         date DATE, title VARCHAR(200), created_at TIMESTAMPTZ)
ratings (id SERIAL PK, show_id FK → shows.id CASCADE,
         person_name VARCHAR(100), score DECIMAL(4,2),
         UNIQUE(show_id, person_name))
```

---

## Konventionen

- Sprache im Code: Englisch
- Kommentare auf Deutsch
- Server Components wo möglich (keine unnötigen `'use client'`)
- Keine externen Libraries ohne explizite Freigabe
- Kein JavaScript wo TypeScript reicht

---

## Deployment

**Plattform:** Vercel
- Build Command: `next build`
- Output Dir: `.next`
- Node Version: 20
- Env Vars in Vercel: `DATABASE_URL`, `APP_PIN`

---

## Was Claude hier tun darf

- App-Logik erweitern (neue Features, Seiten)
- UI verbessern und neue Komponenten bauen
- API-Routen ergänzen
- TODOS.md und AGENTS.md aktualisieren

## Was Claude hier NICHT tun darf

- Prisma oder einen anderen ORM einführen
- NextAuth oder eine andere Auth-Lib einführen
- Dependencies ohne Rückfrage bei Jan installieren
- `db/seed.js` ein zweites Mal ausführen
- Deployment-Config ohne Rückfrage ändern
- Schema-Migrationen ohne Rückfrage ausführen

---

## Häufige Probleme & Fixes

### Neon-Verbindung schlägt fehl
→ `DATABASE_URL` muss Pooler-Hostname sein und `pgbouncer=true&connect_timeout=15` enthalten
→ `channel_binding=require` entfernen — verursacht stille Fehler

### Tailwind-Klassen werden nicht angewendet
→ Tailwind v4: kein `tailwind.config.ts`, Konfiguration via `globals.css`
→ `postcss.config.mjs` muss `@tailwindcss/postcss` verwenden

### `db/seed.js` wirft Fehler
→ Braucht `"type": "module"` in package.json oder direktes ESM-Execution
→ Nur einmal ausführen

### Build schlägt mit TS-Fehler fehl
→ TypeScript-Fehler sind Blocker — immer fixen, nie ignorieren

---

## Roadmap

- [x] Projekt-Scaffold + Agent-Infrastruktur
- [ ] Initialer Deployment-Setup (WWE-001)
- [ ] Show bearbeiten / löschen (WWE-002)
- [ ] Personen-Verwaltung UI (WWE-003)
- [ ] Show-Detail-Ansicht (WWE-004)
- [ ] PWA / "Add to Homescreen"
- [ ] Score-Verlauf als Chart

---

*Letzte Aktualisierung: Mai 2026*
