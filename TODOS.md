# TODOS.md — wwe-rater
Kanonisches Aufgaben- und Evidenzboard für dieses Projekt.
Nach jeder Iteration aktualisieren.

---

## Status-Legende

| Symbol | Bedeutung |
|---|---|
| 🔴 | Blockiert |
| 🟡 | In Arbeit |
| 🟢 | Erledigt |
| ⚪ | Offen |
| ⏸ | Pausiert |

---

## Aktive Tasks

### [WWE-001] Initialer Deployment-Setup
- **Status:** 🟢 Erledigt
- **Priorität:** Hoch
- **Agent:** implementer
- **Beschreibung:** Repo auf GitHub anlegen, Supabase-Datenbank einrichten, auf Vercel deployen
- **Akzeptanzkriterium:** App läuft unter einer Vercel-URL, PIN-Login funktioniert, Seed-Daten sind geladen
- **Prüfmethode:** Im Browser aufrufen, mit PIN einloggen, 48 Shows sichtbar
- **Evidenz:** https://wwe-rater.vercel.app — Mai 2026

---

### [WWE-002] Show bearbeiten / löschen
- **Status:** 🟢 Erledigt
- **Priorität:** Mittel
- **Agent:** orchestrator
- **Beschreibung:** Falsch eingetragene Shows korrigieren oder entfernen können
- **Akzeptanzkriterium:** Edit-Button auf Show-Detail, DELETE-Endpoint, Bestätigungsdialog
- **Prüfmethode:** Show anlegen, editieren, löschen — wird aus der Liste entfernt
- **Evidenz:** Commit 8b86cca — Mai 2026. `DELETE /api/shows/[id]` + `PATCH /api/shows/[id]` implementiert. Inline-Edit-Card in `app/shows/page.tsx`, Bestätigungs-Toggle ohne `window.confirm`. `npm run build` grün.

---

### [WWE-003] Personen-Verwaltung UI
- **Status:** 🟢 Erledigt
- **Priorität:** Mittel
- **Agent:** orchestrator
- **Beschreibung:** UI-Seite zum Verwalten der bewertenden Personen (aktuell nur API vorhanden)
- **Akzeptanzkriterium:** Seite `/settings` oder Modal — Person hinzufügen/entfernen, Änderung sofort sichtbar beim Bewerten
- **Prüfmethode:** 5. Person hinzufügen → erscheint beim nächsten Show-Formular
- **Evidenz:** Commit 0c0e7ee — Mai 2026. `app/settings/page.tsx` erstellt (Client Component). Zahnrad-Link ⚙ im Header von `app/shows/page.tsx`. Bestätigungs-Toggle beim Löschen ohne `window.confirm`. `npm run build` grün.

---

### [WWE-004] Show-Detail-Ansicht
- **Status:** 🟢 Erledigt
- **Priorität:** Niedrig
- **Agent:** orchestrator
- **Beschreibung:** Einzelne Show aufklappen/verlinken: alle Ratings, Schnitt, Abweichung zwischen Personen
- **Akzeptanzkriterium:** `/shows/[id]` zeigt alle Infos zur Show inkl. Spread (wer wich wie stark ab?)
- **Prüfmethode:** Auf Show klicken → Detail-Seite öffnet sich
- **Evidenz:** Commit bc89e88 — Mai 2026. `app/shows/[id]/page.tsx` erstellt (Server Component, force-dynamic). Zeigt Titel, Typ-Badge, Datum, alle Einzel-Ratings farbkodiert, Ø Durchschnitt, Spread (±), höchste/niedrigste Bewertung. Show-Cards in `app/shows/page.tsx` navigieren per onClick zu Detail; Edit/Delete-Buttons nutzen stopPropagation. `npm run build` grün.

---

## Aktive Tasks (Fortsetzung)

### [WWE-005] PWA / "Add to Homescreen"
- **Status:** 🟢 Erledigt
- **Priorität:** Hoch
- **Agent:** frontend-specialist
- **Beschreibung:** App als installierbare PWA — Manifest, Icons, Splash Screen, fullscreen ohne Browser-UI
- **Akzeptanzkriterium:** "Zum Homescreen" in iOS Safari + Android Chrome funktioniert, App startet im Standalone-Mode ohne Adressleiste
- **Prüfmethode:** Auf Handy: Browser → "Zum Homescreen hinzufügen" → App öffnet sich standalone
- **Evidenz:** Commit — Mai 2026. `app/manifest.ts` erstellt (liefert `/manifest.webmanifest`). `app/layout.tsx` mit `Viewport`-Export, `appleWebApp`-Meta-Tags, `theme-color`. SVG-Icon unter `public/icons/icon.svg`. `npm run build` grün.

---

### [WWE-006] UI Overhaul
- **Status:** ⚪ Offen
- **Priorität:** Hoch
- **Agent:** frontend-specialist
- **Beschreibung:** Kompletter visueller Refresh der App — bessere Navigation, moderneres Look & Feel, konsistentere Komponenten
- **Akzeptanzkriterium:** Navbar/Tab-Bar unten für mobile Navigation, verbesserte Cards, bessere Typografie, insgesamt "App-artiger" Look
- **Prüfmethode:** Auf Handy aufrufen — fühlt sich wie eine native App an, nicht wie eine Website
- **Evidenz:** —

---

### [WWE-007] Upcoming Shows Kalender (DE)
- **Status:** ⚪ Offen
- **Priorität:** Mittel
- **Agent:** frontend-specialist + backend-specialist
- **Beschreibung:** Kalender/Liste kommender WWE-Events mit deutschen Zeiten — wann und um wie viel Uhr läuft welche Show in Deutschland
- **Akzeptanzkriterium:** Seite `/upcoming` zeigt die nächsten WWE-Shows mit Datum, Uhrzeit (CET/CEST), Typ und ob sie bereits bewertet wurden
- **Prüfmethode:** Seite aufrufen → aktuelle WWE-Events sichtbar mit DE-Zeiten
- **Evidenz:** —

---

### [WWE-008] Auto-Import WWE Schedule
- **Status:** ⚪ Offen
- **Priorität:** Mittel
- **Agent:** backend-specialist
- **Beschreibung:** Automatisches Anlegen von Shows basierend auf dem offiziellen WWE-Terminplan (z.B. via Web-Scraping oder iCal-Feed)
- **Akzeptanzkriterium:** Neue Shows werden automatisch in die DB eingetragen sobald WWE sie ankündigt; kein manuelles Anlegen nötig für Standard-Shows (RAW montags, SmackDown freitags, PLEs)
- **Prüfmethode:** Cron-Job läuft → neue Show erscheint automatisch in der App
- **Evidenz:** —

---

### [WWE-009] Dark Mode
- **Status:** ⚪ Offen
- **Priorität:** Niedrig
- **Agent:** frontend-specialist
- **Beschreibung:** Dark Mode Support — folgt System-Präferenz oder manuell umschaltbar in Settings
- **Akzeptanzkriterium:** App sieht im Dark Mode gut aus, Toggle in `/settings`
- **Prüfmethode:** System-Dark-Mode aktivieren → App wechselt automatisch
- **Evidenz:** —

---

## Backlog

- [ ] Jahres-Rückblick / Jahresstatistiken filterbar — Priorität: Niedrig
- [ ] Kommentar-Feld pro Bewertung ("was war gut/schlecht") — Priorität: Niedrig
- [ ] Score-Verlauf als Chart (Woche für Woche) — Priorität: Niedrig

---

## Erledigt

### [WWE-000] Projekt-Scaffold + Agent-Infrastruktur
- **Erledigt:** Mai 2026
- **Evidenz:** Vollständiges Next.js 15 Projekt mit allen Dateien, CLAUDE.md, AGENTS.md, Agents, agent-memory.md, Seed-Script für 48 Shows aus Excel

---

## Bekannte Risiken

- `DATABASE_URL` mit `channel_binding=require` verursacht stille Fehler bei Neon → immer Pooler-URL ohne diesen Parameter
- `db/seed.js` nie zweimal ausführen — ON CONFLICT schützt, aber trotzdem nicht riskieren
- Vercel FREE Tier: Serverless Functions haben Cold-Start-Latenz (~1–2s beim ersten Request)

---

## Offene Fragen

- Soll jede Person einzeln bewerten können (jeder hat eigene Session) oder wird gemeinsam bewertet?
- Brauchen wir eine "Noch nicht bewertet"-Ansicht (Show ist angelegt, Rating steht noch aus)?
