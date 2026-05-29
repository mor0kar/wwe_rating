# ⚡ Squared Circle Ratings

> Private Web-App, mit der Jan & seine Freunde (Foffi, Björn, Curry) jede WWE-Show bewerten — der digitale Nachfolger der alten Excel-Tabelle.

Bewertet werden **RAW, SmackDown, Premium Live Events (PLE)** und **Saturday Night's Main Event** auf einer Skala von **0–10** — mit Overflow bis **15** für legendäre Momente (die *DANHAUSEN-Skala* ⚡).

🔗 **Live:** [wwe-rater.vercel.app](https://wwe-rater.vercel.app) · 🔒 Zugang per PIN

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel">
</p>

---

## ✨ Features

- **🥊 Shows bewerten** — Slider von 0–10, optionaler **DANHAUSEN-Bonus** (>10) mit Begründung für „Holy shit"-Momente.
- **🙅 „Dabei"-Schalter** — wer eine Show nicht schaut/bewertet, wird *nicht* in den Schnitt eingerechnet (keine 0-Werte, die den Durchschnitt drücken).
- **📊 Show-Detail** — alle Einzelwertungen, Ø Schnitt, Spread (wer wich am stärksten ab?), höchste/niedrigste Bewertung. Wertungen direkt dort anpassbar.
- **🗓️ Kalender** — kommende Shows mit Ort, lokaler Startzeit **und automatisch umgerechneter deutscher Live-Zeit** (🇩🇪, DST-sicher inkl. Tagesversatz für US-Nachtshows).
- **🔴 „Noch zu bewerten"** — Überblick über bereits gelaufene Shows, die noch keine Wertung haben.
- **🏆 Hall of Fame** — Ranking pro Person, Schnitt pro Show-Typ, Top 5 / Flop 3 und ein **interaktiver Score-Verlauf** (Hover für Details, Klick öffnet die Show).
- **🎟️ PLE-Logos** — Premium Live Events zeigen automatisch ihr Franchise-Logo (WrestleMania, SummerSlam, Royal Rumble …).
- **📱 PWA & Dark Mode** — installierbar als „Add to Homescreen", durchgehend dunkles, mobile-first Design mit Glas-Navigation.

---

## 🧱 Tech Stack

| Bereich       | Technologie                                   |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 16 (App Router)                        |
| Sprache       | TypeScript                                     |
| Styling       | Tailwind CSS v4 + Oswald (Display-Font)        |
| Datenbank     | Supabase PostgreSQL (direkt via `postgres.js`) |
| Auth          | PIN über httpOnly-Cookie (`proxy.ts`)          |
| Deployment    | Vercel                                         |

Bewusst **ohne** ORM (kein Prisma) und **ohne** Auth-Lib (kein NextAuth) — schlank gehalten.

---

## 🚀 Schnellstart

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Env-Datei anlegen und ausfüllen
cp .env.example .env.local
#   POSTGRES_URL → Supabase Transaction-Pooler-URL (Port 6543)
#   APP_PIN      → frei wählbarer PIN

# 3. Datenbank-Schema einspielen (Supabase SQL Editor: db/schema.sql)

# 4. (Einmalig) Alt-Daten aus Excel importieren
node db/seed.js

# 5. Lokal starten
npm run dev   # → http://localhost:3000
```

Ausführliche Anleitung: siehe [`SETUP.md`](./SETUP.md).

### Scripts

| Befehl          | Zweck                          |
| --------------- | ------------------------------ |
| `npm run dev`   | Dev-Server (Turbopack)         |
| `npm run build` | Production-Build               |
| `npm run start` | Production-Server lokal        |

---

## 📁 Projektstruktur

```
app/
├── api/                 # Route Handler (auth, shows, persons)
├── components/          # TopNav, BottomNav, ScoreRing
├── shows/               # Liste, /add, /[id] Detail + RatingEditor
├── stats/               # Hall of Fame + interaktiver Score-Chart
├── upcoming/            # Kalender mit deutscher Live-Zeit
├── settings/            # Personen-Verwaltung
└── layout.tsx, globals.css, manifest.ts
lib/
├── db.ts                # Supabase/postgres.js Client (einzige DB-Verbindung)
├── auth.ts              # PIN-Logik
├── calendar.ts          # Termine + Zeitzonen-Umrechnung
├── score.ts             # Score-Formatierung & -Farben
└── showStyle.ts         # Logos, Badges, Typ-Styles
proxy.ts                 # PIN-Schutz für alle Routen
db/                      # schema.sql, seed.js
```

---

## ⌨️ Konventionen

- Code auf **Englisch**, Kommentare auf **Deutsch**.
- Server Components, wo möglich (`'use client'` nur bei Interaktivität).
- Keine externen Libraries ohne Rückfrage. `db/seed.js` nur **einmal** ausführen.

Aufgaben-Board: [`TODOS.md`](./TODOS.md) · Projektkontext für KI-Assistenten: [`CLAUDE.md`](./CLAUDE.md).

---

## 📦 Deployment

Auf **Vercel** (Build: `next build`, Node 20+). Environment Variables: `POSTGRES_URL`, `APP_PIN`.
Bei verbundener Supabase-Integration wird `POSTGRES_URL` automatisch gesetzt.

---

*Privates Hobby-Projekt — kein offizielles WWE-Produkt. Logos gehören ihren jeweiligen Rechteinhabern.*
