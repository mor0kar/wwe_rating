---
name: project-danhausen-slider
description: Rating slider configuration — 0–10 in 0.1 steps, with optional DANHAUSEN bonus (+0.1–5.0)
metadata:
  type: project
---

The rating slider was changed from `min=0 max=15 step=0.5` to `min=0 max=10 step=0.1`.

**Slider config:**
- `<input type="range" min={0} max={10} step={0.1} />`
- Scale labels: `0`, `5`, `10`
- Display: `score.toFixed(1)` always

**DANHAUSEN-Bonus (per person, optional):**
- Checkbox: `⚡ DANHAUSEN-Moment`
- When checked: number input for bonus (0.1–5.0, step=0.1) + text input for reason
- Effective score = base (slider) + bonus → can exceed 10
- Score display: if total > 10 → `⚡{total.toFixed(1)}` in purple

**State structure (add/page.tsx and EditCard):**
```ts
const [ratings, setRatings] = useState<Record<string, number>>({})   // base scores (0–10)
const [danhausen, setDanhausen] = useState<Record<string, boolean>>({})
const [bonuses, setBonuses] = useState<Record<string, number>>({})   // bonus value per person
const [notes, setNotes] = useState<Record<string, string>>({})       // text reasons
```

**On save:** `effectiveScore = base + (danhausen ? bonus : 0)`. API receives `{ ratings: effectiveRatings, notes: effectiveNotes }`.

**EditCard initial state:** reads `show.notes?.[person]` — if present, activates danhausen toggle and fills note field.

**Why:** Old 0–15 range was confusing and the DANHAUSEN overflow was rarely used. New design keeps normal ratings clean (0–10) with an explicit opt-in bonus for legendary moments.

**How to apply:** Both `app/shows/add/page.tsx` and `EditCard` in `app/shows/page.tsx` use this pattern. [[project-dark-mode]]
