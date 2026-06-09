---
name: project-workflow
description: Validierungs-, Commit- und Doku-Pflicht pro Task; git-Sync wegen paralleler Arbeitsumgebung
metadata:
  type: project
---

Verbindlicher Ablauf pro Task (aus AGENTS.md "Iterationsschema" + gelebte Praxis):

**Validierung vor jedem Commit:**
- `npm run build` muss grün sein (TypeScript-Fehler = harter Blocker, nie ignorieren)
- `npm test` (Vitest) grün halten; bei Änderungen an `lib/calendar.ts` / `lib/score.ts` ggf. Tests ergänzen
- IDE-Lint-Hints zu `min-h-[44px]` / `bg-gradient-to-b` etc. sind kosmetisch (Tailwind-Kanon) → ignorierbar, solange Bestandscode-Pattern

**Dokumentation (Definition of Done):**
- `TODOS.md` nach jedem abgeschlossenen Task aktualisieren (Status 🟢 + Evidenz mit Commit-Hash + "build/test grün")
- `CLAUDE.md` aktualisieren wenn neue Dateien/Routen/Env-Vars/Schema dazukommen
- Neue WWE-IDs fortlaufend vergeben (höchste existierende +1)

**Commits:**
- Conventional-Commit-Stil mit WWE-ID: `feat(WWE-0XX): …`, `fix(...)`, `chore(...)`, `docs(...)`
- Deutsche Commit-Message-Bodies (Code englisch, Kommentare deutsch — Projektkonvention)
- Nur committen/pushen wenn Jan es will bzw. der Task abgeschlossen ist

**git-Sync (WICHTIG — parallele Arbeitsumgebung):**
Jan arbeitet auch von der Arbeit aus am selben Repo. Vor dem Push **immer**
`git fetch` + prüfen ob Remote voraus ist. Bei non-fast-forward:
- Konservativ: lokalen Commit als Patch sichern (`git diff > patch`), `git reset --hard`,
  pullen, Änderungen manuell/kontrolliert gegen den neuen Stand neu anwenden
- Nie blind `--force` pushen
- Nach Pull mit neuen Dependencies (`package.json` geändert) → `npm install`

**Why:** Schon einmal kollidiert (8 Arbeits-Commits voraus). Der konservative
Patch-Weg verhindert Datenverlust bei überlappenden Dateien.

**How to apply:** build+test grün → TODOS/CLAUDE pflegen → fetch → ggf. konservativ
mergen → committen → pushen. Quellen der Wahrheit in Reihenfolge lesen:
AGENTS.md → CLAUDE.md → TODOS.md → Agent-Memory.
