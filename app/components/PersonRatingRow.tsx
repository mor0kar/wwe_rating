'use client'
import { fmt, scoreColor } from '@/lib/score'

// Gemeinsame Bewertungs-Zeile für eine Person — genutzt von Add, Inline-Edit und Detail-Editor.
// Eine einzige Quelle für Slider-Step (0.1), Score-Farbe, DANHAUSEN-Bonus + Begründung.
// Der Eltern-Component hält den State; die Zeile meldet Änderungen als Patch zurück.
export type RatingDraft = {
  active: boolean
  base: number
  danhausen: boolean
  bonus: number
  note: string
}

export default function PersonRatingRow({
  name,
  draft,
  showActiveToggle = true,
  className = '',
  onChange,
}: {
  name: string
  draft: RatingDraft
  showActiveToggle?: boolean
  className?: string
  onChange: (patch: Partial<RatingDraft>) => void
}) {
  const { active, base, danhausen, bonus, note } = draft
  const shown = !showActiveToggle || active
  const total = base + (danhausen ? bonus : 0)
  const clampedBase = Math.min(base, 10)

  return (
    <div className={`transition-opacity ${shown ? '' : 'opacity-40'} ${className}`}>
      {/* Person + Score + optionaler Dabei-Schalter */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-zinc-100">{name}</span>
        <div className="flex items-center gap-3">
          {shown && (
            <span className={`text-base font-semibold ${danhausen ? 'text-purple-400 font-bold' : scoreColor(total)}`}>
              {danhausen ? `⚡${fmt(total)}` : fmt(total)}
            </span>
          )}
          {showActiveToggle && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <span className="text-xs text-zinc-500">dabei</span>
              <input
                type="checkbox"
                checked={active}
                onChange={e => onChange({ active: e.target.checked })}
                className="accent-red-600 w-4 h-4"
              />
            </label>
          )}
        </div>
      </div>

      {shown && (
        <div className="space-y-1.5 mt-2">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={clampedBase}
              onChange={e => onChange({ base: parseFloat(e.target.value) })}
              className="flex-1 accent-zinc-100"
            />
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={clampedBase}
              onChange={e => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v)) onChange({ base: Math.min(10, Math.max(0, v)) })
              }}
              className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-zinc-50 outline-none focus:border-zinc-500 text-center"
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-600">
            <span>0</span><span>5</span><span>10</span>
          </div>

          {/* DANHAUSEN-Toggle */}
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={danhausen}
              onChange={e => onChange({ danhausen: e.target.checked })}
              className="accent-purple-400 w-4 h-4"
            />
            <span className="text-xs text-zinc-500">⚡ DANHAUSEN-Moment</span>
          </label>

          {danhausen && (
            <div className="space-y-1.5 pl-6 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Bonus:</span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={bonus}
                  onChange={e => onChange({ bonus: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-50 outline-none focus:border-purple-500 text-center"
                />
              </div>
              <input
                type="text"
                value={note}
                onChange={e => onChange({ note: e.target.value })}
                placeholder='Begründung (z.B. "Holy shit"-Moment)'
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-50 outline-none focus:border-purple-500 placeholder:text-zinc-600"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
