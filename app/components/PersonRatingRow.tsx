'use client'
import { fmt, momentColor, MOMENT_META, type Moment } from '@/lib/score'

// Gemeinsame Bewertungs-Zeile für eine Person — genutzt von Add, Inline-Edit und Detail-Editor.
// Eine einzige Quelle für Slider-Step (0.1), Score-Farbe und die besonderen Momente:
// ⚡ Holy Shit! (Bonus 0–5, lila) bzw. 👎 Heat (Malus 0–5, rot), jeweils mit Begründung.
// Der Eltern-Component hält den State; die Zeile meldet Änderungen als Patch zurück.
export type RatingDraft = {
  active: boolean
  base: number
  moment: Moment | null
  bonus: number   // Betrag 0–5; wirkt bei 'up' als Bonus, bei 'down' als Malus
  note: string
}

// Effektiver Gesamtscore eines Drafts (Basis ± Moment-Betrag).
export function draftTotal(d: Pick<RatingDraft, 'base' | 'moment' | 'bonus'>): number {
  if (d.moment === 'up') return d.base + d.bonus
  if (d.moment === 'down') return d.base - d.bonus
  return d.base
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
  const { active, base, moment, bonus, note } = draft
  const shown = !showActiveToggle || active
  const total = draftTotal(draft)
  const clampedBase = Math.min(base, 10)

  // Moment-Toggle: Klick auf aktive Richtung schaltet aus, sonst umschalten.
  const toggleMoment = (dir: Moment) => onChange({ moment: moment === dir ? null : dir })

  return (
    <div className={`transition-opacity ${shown ? '' : 'opacity-40'} ${className}`}>
      {/* Person + Score + optionaler Dabei-Schalter */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-zinc-100">{name}</span>
        <div className="flex items-center gap-3">
          {shown && (
            <span className={`text-base font-semibold ${momentColor(moment, total)}`}>
              {moment ? `${MOMENT_META[moment].icon}${fmt(total)}` : fmt(total)}
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
              inputMode="decimal"
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

          {/* Besonderer Moment: ⚡ Holy Shit! (Bonus) oder 👎 Heat (Malus) */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-zinc-500">Moment:</span>
            <button
              type="button"
              onClick={() => toggleMoment('up')}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                moment === 'up'
                  ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 font-medium'
                  : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              ⚡ Holy Shit!
            </button>
            <button
              type="button"
              onClick={() => toggleMoment('down')}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                moment === 'down'
                  ? 'bg-red-950/60 border-red-500/50 text-red-300 font-medium'
                  : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              👎 Heat
            </button>
          </div>

          {moment && (
            <div className="space-y-1.5 pl-6 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{moment === 'up' ? 'Bonus:' : 'Malus:'}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={5}
                  step={0.1}
                  value={bonus}
                  onChange={e => onChange({ bonus: Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)) })}
                  className={`w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-50 outline-none text-center ${
                    moment === 'up' ? 'focus:border-purple-500' : 'focus:border-red-500'
                  }`}
                />
                {moment === 'down' && (
                  <span className="text-[10px] text-zinc-600">wird abgezogen</span>
                )}
              </div>
              <input
                type="text"
                value={note}
                onChange={e => onChange({ note: e.target.value })}
                placeholder={moment === 'up'
                  ? 'Begründung (z.B. "Dieser Spot war unfassbar")'
                  : 'Begründung (z.B. "Dieses Booking, ernsthaft?")'}
                className={`w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-50 outline-none placeholder:text-zinc-600 ${
                  moment === 'up' ? 'focus:border-purple-500' : 'focus:border-red-500'
                }`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
