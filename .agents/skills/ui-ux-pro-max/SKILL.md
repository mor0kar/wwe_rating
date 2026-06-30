---
name: ui-ux-pro-max (pointer)
description: Pointer auf die kanonische Design-Skill unter .claude/skills/ui-ux-pro-max/
---

# ui-ux-pro-max — Pointer

Die eigentliche Skill liegt unter **`.claude/skills/ui-ux-pro-max/SKILL.md`**
(native Claude-Code-Location → auch als `/ui-ux-pro-max` in der Session aufrufbar).

Dieser Stub erfüllt nur die Projekt-Konvention `.agents/skills/[bereich]/SKILL.md`,
damit Agents, die dieser Konvention folgen, die Skill finden — ohne 8MB zu duplizieren.

**Aufruf** (Windows: `python`):

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -f markdown
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack nextjs
```

Constraint: Dark-Mode (zinc), mobile-first, Tailwind v4 schlagen jede gegenteilige
Skill-Empfehlung. Details: `CLAUDE.md` / `AGENTS.md` → „Design-Intelligenz".
