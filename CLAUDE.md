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
│   │   ├── shows/[id]/route.ts  ← Show PATCH/POST/DELETE + Einzel-Rating
│   │   └── persons/route.ts     ← Personen GET/POST/DELETE
│   ├── components/
│   │   ├── TopNav.tsx           ← Desktop-Navigation (Glas)
│   │   ├── BottomNav.tsx        ← Mobile Tab-Bar (Glas)
│   │   └── ScoreRing.tsx        ← SVG-Score-Gauge
│   ├── login/page.tsx           ← PIN-Eingabe (public)
│   ├── shows/
│   │   ├── page.tsx             ← Show-Liste + "Noch zu bewerten" (Client)
│   │   ├── add/page.tsx         ← Neue Show erfassen
│   │   └── [id]/page.tsx        ← Show-Detail + RatingEditor.tsx
│   ├── stats/page.tsx           ← Statistiken + Score-Chart (Server Component)
│   ├── upcoming/page.tsx        ← Kalender mit DE-Zeit (Client)
│   ├── settings/page.tsx        ← Personen-Verwaltung (Client)
│   ├── manifest.ts              ← PWA-Manifest
│   ├── layout.tsx
│   ├── page.tsx                 ← Redirect → /shows
│   └── globals.css
├── lib/
│   ├── db.ts                    ← postgres.js Client (Supabase, einzige DB-Verbindung)
│   ├── auth.ts                  ← PIN-Konstanten, checkPin()
│   ├── calendar.ts              ← getUpcomingEvents() + DE-Zeit-Umrechnung
│   ├── score.ts                 ← fmt / scoreColor / scoreHex / scoreLabel
│   └── showStyle.ts             ← getShowLogo + BADGE / BORDER_ACCENT / TINT
├── proxy.ts                      ← PIN-Schutz für alle Routen (Next.js 16; ex middleware.ts)
├── db/
│   ├── schema.sql               ← DB-Schema (im Supabase SQL Editor ausführen)
│   └── seed.js                  ← Einmaliger Import der Excel-Shows
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
- Env Vars in Vercel: `POSTGRES_URL`, `APP_PIN`

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

### DB-Verbindung schlägt fehl
→ `POSTGRES_URL` muss die Supabase-Pooler-URL sein (Port 6543, `pgbouncer=true`)
→ `lib/db.ts` nutzt `max: 1` + Custom-DATE-Parser (DATE bleibt als `YYYY-MM-DD`-String)

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

Detaillierter Stand: siehe `TODOS.md`.

- [x] Projekt-Scaffold + Agent-Infrastruktur
- [x] Deployment-Setup (WWE-001)
- [x] Show bearbeiten / löschen (WWE-002)
- [x] Personen-Verwaltung UI (WWE-003)
- [x] Show-Detail-Ansicht + Wertung anpassen (WWE-004, WWE-013)
- [x] PWA / "Add to Homescreen" (WWE-005)
- [x] UI Overhaul + Display-Font (WWE-006, WWE-019)
- [x] Kalender mit DE-Zeit (WWE-007)
- [x] Rebranding "Squared Circle Ratings" + NXT raus (WWE-011, WWE-012)
- [x] PLE-Logos (WWE-014)
- [x] Score-Verlauf als Chart (WWE-017)
- [ ] Auto-Import WWE-Terminplan (WWE-008) — wartet auf API-Entscheidung

---

*Letzte Aktualisierung: Mai 2026*
