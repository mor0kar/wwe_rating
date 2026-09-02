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
│   │   ├── persons/route.ts     ← Personen GET/POST/DELETE
│   │   ├── cron/discord/route.ts ← Vercel-Cron: tägliche Discord-Erinnerung
│   │   └── export/route.ts      ← Datenexport CSV/JSON (WWE-028)
│   ├── components/
│   │   ├── TopNav.tsx           ← Desktop-Navigation (Glas)
│   │   ├── BottomNav.tsx        ← Mobile Tab-Bar (Glas)
│   │   ├── ScoreRing.tsx        ← SVG-Score-Gauge
│   │   ├── CalendarReminder.tsx ← Reminder, Kalender-Liste zu pflegen
│   │   ├── ShowLogo.tsx         ← Zentrales Logo-Rendering mit Badge-Fallback
│   │   └── PersonRatingRow.tsx  ← Einheitliche Rating-Zeile (Add/Edit/Detail)
│   ├── login/page.tsx           ← PIN-Eingabe (public)
│   ├── shows/
│   │   ├── page.tsx             ← Show-Liste + "Für dich offen" + Client-Filter
│   │   ├── add/page.tsx         ← Neue Show erfassen (Suspense wegen useSearchParams)
│   │   └── [id]/                ← Show-Detail
│   │       ├── page.tsx         ← Server Component
│   │       ├── RatingEditor.tsx ← Bearbeitungs-Form (Spoiler-aware)
│   │       ├── RatingsView.tsx  ← Bewertungs-Liste (Spoiler-aware)
│   │       └── HeaderScore.tsx  ← ScoreRing im Header (Spoiler-aware)
│   ├── stats/
│   │   ├── page.tsx             ← Hall of Fame, Awards, Streit-o-Meter
│   │   └── ScoreTimeline.tsx    ← SVG-Verlauf, antippbare Slices
│   ├── upcoming/page.tsx        ← Kalender + Custom-Events (12h/24h-Toggle)
│   ├── settings/page.tsx        ← Personen + "Das bin ich" + Spoiler-Toggle + Export
│   ├── manifest.ts              ← PWA-Manifest
│   ├── layout.tsx
│   ├── page.tsx                 ← Redirect → /shows
│   └── globals.css
├── lib/
│   ├── db.ts                    ← postgres.js Client (Supabase, einzige DB-Verbindung)
│   ├── auth.ts                  ← PIN-Konstanten, checkPin()
│   ├── calendar.ts              ← getUpcomingEvents, germanWatchTime, missingShowWeeks, airsOnLabel
│   ├── calendar.test.ts         ← Vitest: Zeitzonen / DST / liveFriendly
│   ├── customEvents.ts          ← useCustomEvents-Hook (localStorage, pro Browser)
│   ├── identity.ts              ← useIdentity-Hook ("Das bin ich" + Spoiler-Toggle)
│   ├── score.ts                 ← fmt / scoreColor / scoreHex / scoreLabel / avgScore
│   ├── score.test.ts            ← Vitest: Score-Helpers
│   └── showStyle.ts             ← BADGE, BORDER_ACCENT, TINT, SHOW_TYPES, SHOW_FILTERS, getShowLogo
├── proxy.ts                     ← PIN-Schutz für alle Routen (Next.js 16; ex middleware.ts)
├── vercel.json                  ← Cron-Schedule (täglich 07:00 UTC → /api/cron/discord)
├── vitest.config.ts             ← Test-Setup (lib/*.test.ts)
├── db/
│   ├── schema.sql               ← DB-Schema (im Supabase SQL Editor ausführen)
│   ├── seed.js                  ← Einmaliger Import der Excel-Shows
│   └── migrations/              ← Nachträgliche Schema-Änderungen (siehe README)
├── .agents/skills/              ← Projekt-Skill-Konvention (Pointer → .claude/skills/)
└── .claude/
    ├── agents/                  ← orchestrator, planner, implementer,
    │                              frontend-specialist, backend-specialist,
    │                              session-handoff, prompt-optimizer
    └── skills/                  ← UI/UX Pro Max Design-Skill (ui-ux-pro-max + 6 weitere)
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
- `>10` → `text-purple-400 font-bold` (⚡ Holy Shit!-Overflow, ⚡-Prefix)
- `<0` → `text-red-500 font-bold` (👎 Heat-Overflow, 👎-Prefix)
- `≥7` → `text-green-400`
- `≥4` → `text-amber-500`
- `<4` → `text-red-400`

Besondere Momente (`ratings.moment`, zentral in `lib/score.ts`):
- `'up'` = ⚡ **Holy Shit!-Moment** — Bonus 0–5 auf den Basis-Score, lila, mit Begründung
- `'down'` = 👎 **Heat** — Malus 0–5 (wird abgezogen), rot, mit Begründung
- Helfer: `momentColor()`, `momentLabel()`, `MOMENT_META`, `draftTotal()` (in `PersonRatingRow`)

Fonts:
- Headlines/Wordmark/Scores: **Oswald** (athletic/condensed) via `next/font/google`, geladen in `app/layout.tsx`, als CSS-Var `--font-oswald` → Theme-Token `--font-heading` (Utility `font-heading`). h1/h2/h3 nutzen sie automatisch (`@layer base` in `globals.css`).
- Body/UI: System-Font-Stack.

---

## Design-Intelligenz — UI/UX Pro Max Skill

Für **jede** visuelle/UI-Entscheidung (neue Seite, Komponente, Style, Farbe, Typo, Animation, Layout, Accessibility-Review) wird die Skill `ui-ux-pro-max` konsultiert. Sie liegt unter `.claude/skills/` (im Repo, also für Session **und** alle Agents verfügbar) und ist eine durchsuchbare Design-Datenbank (67 Styles, 161 Farbpaletten, 57 Font-Pairings, 99 UX-Regeln, Stack-Guides für Next.js/Tailwind/shadcn u.a.).

**Wann nutzen:** neue Seiten/Komponenten bauen, Style/Farbe/Font wählen, UI auf UX/Accessibility reviewen, Dark-Mode/Animation/Layout-Fragen. **Wann nicht:** reines Backend, API/DB, Infra.

**Aufruf** (Windows → `python`, nicht `python3`):

```bash
# 1. Design-System für ein Vorhaben (immer zuerst):
python .claude/skills/ui-ux-pro-max/scripts/search.py "<produkt> <industrie> <keywords>" --design-system -f markdown

# 2. Detail-Suche in einer Domäne (style|color|typography|ux|chart|landing|product):
python .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain ux

# 3. Stack-spezifische Best Practices:
python .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack nextjs
```

**Projekt-Constraint hat Vorrang:** Die App ist **Dark-Mode (zinc-Palette)**, mobile-first, Tailwind v4. Skill-Empfehlungen, die dem widersprechen (z.B. Light-Background-Vorschläge), werden an den bestehenden Stil angepasst, nicht blind übernommen. Die Skill liefert Reasoning/Optionen — die finalen Tokens bleiben konsistent mit `globals.css` / `lib/showStyle.ts`.

Weitere mitgelieferte Skills (`.claude/skills/`): `design`, `design-system`, `ui-styling`, `brand`, `banner-design`, `slides` — bei Bedarf nutzbar, Kern fürs Web-Redesign ist `ui-ux-pro-max`.

---

## Datenbank-Schema

```sql
persons (id SERIAL PK, name VARCHAR(100) UNIQUE)
shows   (id SERIAL PK, type VARCHAR(20) CHECK IN ('RAW','SmackDown','PLE','SNM','NXT'),
         date DATE, title VARCHAR(200), comment VARCHAR(300), created_at TIMESTAMPTZ)
ratings (id SERIAL PK, show_id FK → shows.id CASCADE,
         person_name VARCHAR(100), score DECIMAL(4,2), note TEXT,
         moment TEXT CHECK IN ('up','down'),
         UNIQUE(show_id, person_name))
```

- `shows.comment` — interner Spitzname für die Folge ("Die Stuhl-Match-Folge")
- `ratings.moment` — besonderer Moment: `'up'` = ⚡ Holy Shit! (Bonus, lila), `'down'` = 👎 Heat (Malus, rot), `NULL` = normal
- `ratings.note` — Begründung für den besonderen Moment, wird in der Übersicht als Hover-Tooltip angezeigt

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
- Env Vars in Vercel:
  - `POSTGRES_URL` — Supabase-Pooler (Port 6543, `pgbouncer=true`)
  - `APP_PIN` — gemeinsamer Login-PIN
  - `DISCORD_WEBHOOK_URL` — Channel-Webhook für tägliche Erinnerungen
  - `CRON_SECRET` — schützt `/api/cron/discord` (Vercel sendet automatisch als `Authorization: Bearer …`)
- Cron: `vercel.json` triggert täglich 07:00 UTC `/api/cron/discord`

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
- [x] Slider-Snap, Spitzname pro Folge, DANHAUSEN in Übersicht (WWE-020)
- [x] Kalender-Lücken-Hinweis & Aktualisierungs-Reminder (WWE-021)
- [x] Live-machbar-Hinweis im Kalender (WWE-022)
- [x] Discord-Benachrichtigungen via Webhook + Vercel-Cron (WWE-023)
- [x] Codebase-Cleanup & Doku-Refresh (WWE-024)
- [x] "Wer bin ich?" + Spoiler-Schutz (WWE-025)
- [x] Stats-Paket: Hall of Fame, Auszeichnungen, Streit-o-Meter (WWE-026)
- [x] "Für dich noch offen" — persönliche Bewert-To-Dos (WWE-027)
- [x] Daten-Export CSV/JSON (WWE-028)
- [x] Test-Setup Vitest für Zeitzonen-/Score-Logik (WWE-029)
- [x] Logos zentralisiert (`<ShowLogo>`) + Rating-Editor vereinheitlicht (WWE-030/031)
- [x] UI/UX-Feinschliff (WWE-032)
- [x] Score-Verlauf: Punkte zuverlässig antippbar (WWE-033)
- [x] Kalender-Pflege + Custom-Events + 12h/24h-Toggle (WWE-034)
- [ ] Auto-Import WWE-Terminplan (WWE-008) — wartet auf API-Entscheidung

---

*Letzte Aktualisierung: Juni 2026*
