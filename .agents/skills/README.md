# .agents/skills/

Projekt-Skill-Konvention für wwe-rater. Agents prüfen hier vor einem Task,
ob es bereichsspezifische Skills/Constraints gibt.

## Installierte Skills

| Skill | Ort (kanonisch) | Wofür |
|---|---|---|
| **ui-ux-pro-max** | `.claude/skills/ui-ux-pro-max/` | Design-Intelligenz: Styles, Farben, Fonts, UX-Regeln, Stack-Guides. **Pflicht bei UI-Arbeit.** |
| design, design-system, ui-styling | `.claude/skills/` | Tiefere Design-/Token-/shadcn-Workflows (bei Bedarf) |
| brand, banner-design, slides | `.claude/skills/` | Branding, Banner, Präsentationen (selten relevant fürs Web-Redesign) |

> Die echten Skill-Dateien liegen unter **`.claude/skills/`** (native Claude-Code-Location,
> dadurch auch direkt als `/ui-ux-pro-max` in der Session aufrufbar). Dieser Ordner hält nur
> Pointer, um die `.agents/skills/[bereich]/SKILL.md`-Konvention nicht zu brechen — kein Duplikat.

## Nutzung (UI/Design)

Windows → `python` (nicht `python3`):

```bash
# Design-System für ein Vorhaben (immer zuerst):
python .claude/skills/ui-ux-pro-max/scripts/search.py "<produkt> <industrie> <keywords>" --design-system -f markdown

# Detail-Suche:  --domain style|color|typography|ux|chart|landing|product
python .claude/skills/ui-ux-pro-max/scripts/search.py "accessibility animation" --domain ux

# Stack-Guides:  --stack nextjs | react | shadcn | html-tailwind ...
python .claude/skills/ui-ux-pro-max/scripts/search.py "list performance" --stack nextjs
```

Vollständige Anleitung: `CLAUDE.md` → „Design-Intelligenz", `AGENTS.md` → „Design-Intelligenz",
sowie die jeweilige `.claude/skills/<skill>/SKILL.md`.

## Projekt-Constraint vor Skill

Die App ist **Dark-Mode (zinc), mobile-first, Tailwind v4**, Show-Typen ohne NXT.
Skill-Empfehlungen, die dem widersprechen, werden an den bestehenden Stil
(`globals.css`, `lib/showStyle.ts`) angepasst — nie blind übernommen.
