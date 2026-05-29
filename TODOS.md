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
- **Status:** 🟢 Erledigt
- **Priorität:** Hoch
- **Agent:** frontend-specialist
- **Beschreibung:** Kompletter visueller Refresh der App — bessere Navigation, moderneres Look & Feel, konsistentere Komponenten
- **Akzeptanzkriterium:** Navbar/Tab-Bar unten für mobile Navigation, verbesserte Cards, bessere Typografie, insgesamt "App-artiger" Look
- **Prüfmethode:** Auf Handy aufrufen — fühlt sich wie eine native App an, nicht wie eine Website
- **Evidenz:** Commit 10dacc2 — Mai 2026. `app/components/BottomNav.tsx` erstellt (fixed bottom, 5 Tabs: Shows/Stats/Neu/Kalender/Settings, erhöhter Neu-Button, active state, safe-area-insets, Login ausgeblendet). Alle Page-Header bereinigt — Navigation nur noch in BottomNav. `pb-24` auf allen Seiten. Login-Page mit Logo-Badge und Untertitel. `scrollbar-none` utility in globals.css. `antialiased` in layout.tsx. `npm run build` grün.

---

### [WWE-007] Upcoming Shows Kalender (DE)
- **Status:** 🟢 Erledigt
- **Priorität:** Mittel
- **Agent:** frontend-specialist + backend-specialist
- **Beschreibung:** Kalender/Liste kommender WWE-Events mit deutschen Zeiten — wann und um wie viel Uhr läuft welche Show in Deutschland
- **Akzeptanzkriterium:** Seite `/upcoming` zeigt die nächsten WWE-Shows mit Datum, Uhrzeit (CET/CEST), Typ und ob sie bereits bewertet wurden
- **Prüfmethode:** Seite aufrufen → aktuelle WWE-Events sichtbar mit DE-Zeiten
- **Evidenz:** Commit 8da69f0 — Mai 2026. `lib/calendar.ts` mit zentraler `getUpcomingEvents()` + IANA-Zeitzonen; DST-sichere Umrechnung auf Europe/Berlin via `Intl` (`germanWatchTime`, inkl. Tagesversatz für US-Nachtshows). `/upcoming` zeigt Ortszeit + 🇩🇪 Live-Zeit. Bereits angelegte Shows werden als „Bewertet/Angelegt ✓" markiert (Abgleich Typ+Datum gegen `/api/shows`) → verhindert Doppel-Anlage. `npm run build` grün.

---

### [WWE-008] Auto-Import WWE Schedule
- **Status:** ⚪ Offen
- **Priorität:** Mittel
- **Agent:** backend-specialist
- **Beschreibung:** Automatisches Anlegen von Shows basierend auf dem offiziellen WWE-Terminplan (z.B. via Web-Scraping oder iCal-Feed)
- **Akzeptanzkriterium:** Neue Shows werden automatisch in die DB eingetragen sobald WWE sie ankündigt; kein manuelles Anlegen nötig für Standard-Shows (RAW montags, SmackDown freitags, PLEs)
- **Prüfmethode:** Cron-Job läuft → neue Show erscheint automatisch in der App
- **Evidenz:** — | **Recherche Mai 2026:** TheSportsDB (Liga 4444) liefert saubere UTC-Zeiten + Venue, aber die **kostenlose** Stufe kappt bei ~15 Events/Call → für Zukunfts-Termine **Premium-Key nötig** (Patreon ~3–5 $/Mo). Entscheidung vorerst: kuratierte Liste in `lib/calendar.ts`, Code ist API-ready (nur `getUpcomingEvents()` umbauen).

---

### [WWE-011] Rebranding → „Squared Circle Ratings"
- **Status:** 🟢 Erledigt
- **Priorität:** Mittel
- **Beschreibung:** „WWE Rater" überall durch „Squared Circle Ratings" ersetzen
- **Akzeptanzkriterium:** Nav-Logo, Hero `/shows`, Login, Tab-Titel, PWA-Manifest tragen den neuen Namen
- **Evidenz:** Commit 8da69f0 — Mai 2026. TopNav, Hero, Login, `layout.tsx`-Metadata, `manifest.ts`. `npm run build` grün.

---

### [WWE-012] NXT entfernen
- **Status:** 🟢 Erledigt
- **Priorität:** Niedrig
- **Beschreibung:** NXT wird nicht bewertet → aus der UI nehmen
- **Akzeptanzkriterium:** Kein NXT in Filter-Chips, Typ-Auswahl beim Eintragen und Stats-Auswertung
- **Evidenz:** Commit 8da69f0 — Mai 2026. `FILTERS`, `TYPES`, `typeStats` bereinigt. `ShowType` erlaubt nur RAW/SmackDown/PLE/SNM.

---

### [WWE-013] Wertung auf Show-Detailseite anpassen
- **Status:** 🟢 Erledigt
- **Priorität:** Mittel
- **Beschreibung:** Beim Klick auf eine Show direkt dort alle Wertungen bearbeiten (nicht nur unbewertete nachtragen)
- **Akzeptanzkriterium:** Editor auf `/shows/[id]` mit allen Personen, vorbefüllt, „dabei"-Schalter (Curry sauber ausschließbar), DANHAUSEN-Bonus
- **Evidenz:** Commit 8da69f0 — Mai 2026. `app/shows/[id]/RatingEditor.tsx` ersetzt `AddRatingSection`; speichert via `PATCH /api/shows/[id]`. `npm run build` grün.

---

### [WWE-014] PLE-Logos pro Event
- **Status:** 🟢 Erledigt
- **Priorität:** Niedrig
- **Beschreibung:** PLEs mit echtem Franchise-Logo statt generischem „PLE"-Badge anzeigen
- **Akzeptanzkriterium:** Logo wird anhand des Titels erkannt (WrestleMania, SummerSlam, Royal Rumble, Elimination Chamber, MITB, Backlash, Survivor Series); Fallback auf Badge
- **Evidenz:** Commit 8d31207 — Mai 2026. `lib/showLogos.ts` mit `getShowLogo(type, title)`, genutzt in `/shows`, `/shows/[id]`, `/stats`, `/upcoming`. Logos von Wikimedia/Wikipedia (alle HTTP 200 verifiziert). `npm run build` grün.

---

### [WWE-015] Next.js-16-Build-Fix
- **Status:** 🟢 Erledigt
- **Priorität:** Hoch
- **Beschreibung:** Vercel-Build scheiterte unter Next.js 16 am Prerendering von `/shows/add` (`useSearchParams` ohne Suspense)
- **Akzeptanzkriterium:** Build läuft grün durch
- **Evidenz:** Commit c7dfbff — Mai 2026. `AddShowForm` in `<Suspense>` gewrappt. `npm run build` grün (12/12 Seiten).

---

### [WWE-009] Dark Mode
- **Status:** 🟢 Erledigt
- **Priorität:** Niedrig
- **Agent:** frontend-specialist
- **Beschreibung:** Hardcoded Dark Mode — kein Toggle, kein prefers-color-scheme, einfach immer dark
- **Akzeptanzkriterium:** Komplette App in zinc-950/zinc-900 Farbpalette; Score-Farben, Badges, Progress-Bars alle dark-tauglich
- **Prüfmethode:** App auf Handy aufrufen — alles dunkel, gut lesbar
- **Evidenz:** Mai 2026. Alle Seiten und Komponenten auf zinc-Palette umgestellt. DANHAUSEN-Bonus-Feature (Slider 0–10 + Bonus-Checkbox) hinzugefügt. Stats-Seite: farbige Progress-Bars, Rang-Badges (Gold/Silber/Bronze), Flop-3-Abschnitt, Typ-Badge in Top/Flop-Listen. Show-Detail: notes werden angezeigt. `npm run build` grün.

---

### [WWE-016] Noch-zu-bewerten Überblick
- **Status:** 🟢 Erledigt
- **Priorität:** Mittel
- **Agent:** frontend-specialist
- **Beschreibung:** Zentrale Ansicht/Filter, welche bereits gelaufenen Shows noch nicht (oder nicht von allen) bewertet wurden — eine echte To-Do-Liste fürs Bewerten, ergänzend zur Kalender-Markierung
- **Akzeptanzkriterium:** Sichtbarer Hinweis (z.B. Filter „offen" auf `/shows` oder Sektion auf der Startseite), der gelaufene, noch unbewertete Events listet; optional pro Person „fehlt noch"
- **Prüfmethode:** Show ohne (vollständige) Bewertung anlegen → erscheint im „offen"-Überblick; nach dem Bewerten verschwindet sie
- **Evidenz:** Mai 2026. „Noch zu bewerten"-Sektion oben auf `/shows`: listet gelaufene Kalender-Events (`eventInstant(ev) < now`) ohne angelegte Show (Abgleich Typ+Datum gegen alle Shows, filterunabhängig). Direkter „Bewerten"-Button → vorbefülltes `/shows/add`. `npm run build` grün. Hinweis: Event-Ebene umgesetzt; „pro Person fehlt noch" als mögliche Erweiterung offen.

---

### [WWE-017] Score-Verlauf als Chart
- **Status:** 🟢 Erledigt
- **Priorität:** Niedrig
- **Agent:** frontend-specialist
- **Beschreibung:** Trend der Bewertungen über die Zeit (pro Person und/oder Show-Typ) als kleine Kurve auf der Stats-Seite — kein externes Chart-Lib, reines SVG
- **Akzeptanzkriterium:** Auf `/stats` eine Verlaufs-Grafik (z.B. Ø pro Woche/Show), lesbar im Dark Mode, mobil tauglich
- **Prüfmethode:** Stats-Seite aufrufen → Kurve zeigt Entwicklung der Schnitte über die Saison
- **Evidenz:** Mai 2026. `ScoreTimeline`-Komponente (reines SVG, viewBox-skaliert) auf `/stats`: chronologischer Verlauf der Show-Durchschnitte, Fläche+Linie, Punkte farbkodiert nach Score (inkl. DANHAUSEN-Lila >10), Gridlines + Y-Achse (0/5/10/max), gestrichelte Referenzlinie für den Gesamtschnitt, Datums-Labels. `timeline` in `getStats()` ergänzt. `npm run build` grün.

---

### [WWE-018] middleware.ts → proxy.ts (Next-16-Cleanup)
- **Status:** 🟢 Erledigt
- **Priorität:** Niedrig
- **Agent:** backend-specialist
- **Beschreibung:** Next.js 16 hat die `middleware`-Konvention zugunsten von `proxy` deprecated → Datei umbenennen, um die Build-Warnung zu beseitigen
- **Akzeptanzkriterium:** PIN-Schutz funktioniert unverändert, Build wirft keine middleware-Deprecation-Warnung mehr
- **Prüfmethode:** `npm run build` → keine Warnung; eingeloggt/ausgeloggt testen → Schutz greift
- **Evidenz:** Mai 2026. `middleware.ts` → `proxy.ts`, Funktion `middleware` → `proxy` (gemäß Next-16-Doku), `config`/matcher unverändert. `npm run build` ohne Deprecation-Warnung.

---

### [WWE-019] UI Overhaul v2 (Modernisierung)
- **Status:** 🟢 Erledigt
- **Priorität:** Hoch
- **Agent:** frontend-specialist
- **Beschreibung:** App von „Admin-Dashboard"-Look zu moderner Wrestling-App — Display-Font, Score als Hero-Element, Scorecard-Look, Glas-Nav, einheitliche Header mit Textur
- **Akzeptanzkriterium:** Markante Headlines, Score visuell prominent, Karten mit Tiefe/Tönung, blurred Navigation mit aktivem Indikator, Lade-Skeletons, konsistente Header
- **Evidenz:** Mai 2026. (1) **Font:** Oswald via `next/font` → `--font-heading`, h1/h2/h3 + Wordmark + Scores. (2) **ScoreRing** (`app/components/ScoreRing.tsx`, SVG-Gauge, DANHAUSEN-Glow) auf `/shows`-Cards und groß im Detail-Header. (3) **Scorecard-Look:** typ-getönte Verläufe (`card-tint-*`), größere Logos, Press-Animation, `animate-fade-in`. (4) **Glas-Nav:** `backdrop-blur` Top-/Bottom-Nav + aktiver Indikator (Pill/Underline). (5) **Skeletons** statt „Lädt…". (6) **Header+Textur:** Grain-Overlay (`texture-grain`) + Rot-Glow auf Hero/Stats/Kalender. CLAUDE.md (Font-Regel) aktualisiert. `npm run build` grün (12/12).

---

## Backlog

- [ ] Jahres-Rückblick / Jahresstatistiken filterbar — Priorität: Niedrig
- [ ] Kommentar-Feld pro Bewertung ("was war gut/schlecht") — Priorität: Niedrig
- [ ] DANHAUSEN Hall of Fame — Ansicht aller ⚡>10-Momente — Priorität: Niedrig

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
