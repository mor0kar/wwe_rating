---
name: project-dark-mode
description: App uses hardcoded dark mode (zinc palette) — no toggle, no prefers-color-scheme
metadata:
  type: project
---

The app is fully dark-mode-only. No light mode, no toggle, no `prefers-color-scheme`.

**Color palette (dark):**
- Background: `bg-zinc-950` (body, page backgrounds, inputs)
- Cards: `bg-zinc-900 border border-zinc-800 rounded-2xl`
- Text primary: `text-zinc-50`
- Text secondary: `text-zinc-100` / `text-zinc-300`
- Text muted: `text-zinc-400` / `text-zinc-500`
- Text disabled: `text-zinc-600`
- Borders: `border-zinc-800` (cards), `border-zinc-700` (inputs, inactive buttons)
- Input bg: `bg-zinc-950` or `bg-zinc-900`
- Buttons primary: `bg-zinc-100 text-zinc-950` (inverted for contrast)
- Buttons active/selected: `bg-zinc-100 text-zinc-950 border-zinc-100`
- Buttons inactive: `border-zinc-700 text-zinc-500`
- Hover/active touch: `active:bg-zinc-800`

**Badge colors (dark-friendly):**
- RAW: `bg-red-950 text-red-400`
- SmackDown: `bg-blue-950 text-blue-400`
- PLE: `bg-purple-950 text-purple-400`
- SNM: `bg-amber-950 text-amber-400`
- NXT: `bg-green-950 text-green-400`

**Score colors (dark-friendly):**
- `> 10`: `text-purple-400 font-bold` (DANHAUSEN)
- `>= 7`: `text-green-400`
- `>= 4`: `text-amber-500`
- `< 4`: `text-red-400`

**CSS vars in globals.css** are also updated to dark badge colors.

**Why:** User wants only dark mode — keeps the app consistent and easier to read at night.

**How to apply:** Use zinc palette everywhere. Never use gray-50, white, or bg-white. Always use the inverted `bg-zinc-100 text-zinc-950` pattern for primary CTA buttons.
