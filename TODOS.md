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
- **Status:** ⚪ Offen
- **Priorität:** Mittel
- **Agent:** frontend-specialist + backend-specialist
- **Beschreibung:** Falsch eingetragene Shows korrigieren oder entfernen können
- **Akzeptanzkriterium:** Edit-Button auf Show-Detail, DELETE-Endpoint, Bestätigungsdialog
- **Prüfmethode:** Show anlegen, editieren, löschen — wird aus der Liste entfernt
- **Evidenz:** —

---

### [WWE-003] Personen-Verwaltung UI
- **Status:** ⚪ Offen
- **Priorität:** Mittel
- **Agent:** frontend-specialist
- **Beschreibung:** UI-Seite zum Verwalten der bewertenden Personen (aktuell nur API vorhanden)
- **Akzeptanzkriterium:** Seite `/settings` oder Modal — Person hinzufügen/entfernen, Änderung sofort sichtbar beim Bewerten
- **Prüfmethode:** 5. Person hinzufügen → erscheint beim nächsten Show-Formular
- **Evidenz:** —

---

### [WWE-004] Show-Detail-Ansicht
- **Status:** ⚪ Offen
- **Priorität:** Niedrig
- **Agent:** frontend-specialist
- **Beschreibung:** Einzelne Show aufklappen/verlinken: alle Ratings, Schnitt, Abweichung zwischen Personen
- **Akzeptanzkriterium:** `/shows/[id]` zeigt alle Infos zur Show inkl. Spread (wer wich wie stark ab?)
- **Prüfmethode:** Auf Show klicken → Detail-Seite öffnet sich
- **Evidenz:** —

---

## Backlog

- [ ] PWA / "Add to Homescreen" Support — damit es sich wie eine echte App anfühlt — Priorität: Mittel
- [ ] Jahres-Rückblick / Jahresstatistiken filterbar — Priorität: Niedrig
- [ ] Kommentar-Feld pro Bewertung ("was war gut/schlecht") — Priorität: Niedrig
- [ ] Score-Verlauf als Chart (Woche für Woche) — Priorität: Niedrig
- [ ] Dark Mode — Priorität: Niedrig

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
