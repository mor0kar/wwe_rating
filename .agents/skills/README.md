# .agents/skills/

Projekt-Skills für wwe-rater — installiert via curl aus bekannten Skill-Repos.

## Installierte Skills

(noch keine — bei Bedarf installieren)

## Skills installieren

```bash
# Beispiel: Next.js Skill
mkdir -p .agents/skills/nextjs
curl -s https://raw.githubusercontent.com/vercel-labs/next-skills/main/SKILL.md \
  -o .agents/skills/nextjs/SKILL.md

# Beispiel: Supabase Agent Skills (hier nicht nötig, aber als Referenz)
# curl -s https://raw.githubusercontent.com/supabase/agent-skills/main/SKILL.md \
#   -o .agents/skills/supabase/SKILL.md
```

## Empfohlene Skills für dieses Projekt

- `vercel-labs/next-skills` — Next.js App Router Best Practices
- `wshobson/agents` — Allgemeine Agent-Patterns

## Hinweis

Skills werden von Agents gelesen bevor sie an einem entsprechenden Task arbeiten.
Agents prüfen `.agents/skills/[bereich]/SKILL.md` für projektspezifische Constraints.
