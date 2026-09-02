'use client'
// Formular zum Anlegen/Bearbeiten von Custom-Events (localStorage, pro Browser).
// Enthält den 24h/12h-Zeitformat-Toggle; gespeichert wird immer 24h "HH:mm".
import { useState } from 'react'
import { isValidTz, TZ_OPTIONS } from '@/lib/calendar'
import { SHOW_TYPES, type ShowType } from '@/lib/showStyle'
import { addCustomEvent, updateCustomEvent, type CustomEvent } from '@/lib/customEvents'

// Default-Zeitzone fürs Dropdown: Browser-Zone wenn sie in TZ_OPTIONS vorkommt,
// sonst Europe/Berlin. So ist die Auswahl immer ein gültiger Listenwert.
function defaultTz(): string {
  let browser = 'Europe/Berlin'
  try { browser = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin' }
  catch { /* Fallback bleibt Berlin */ }
  const known = TZ_OPTIONS.flatMap(g => g.zones).some(z => z.value === browser)
  return known ? browser : 'Europe/Berlin'
}

// 24h "HH:mm" → 12h-Komponenten
function to12h(hhmm: string): { h: number; m: number; period: 'AM' | 'PM' } {
  const [h24, m] = hhmm.split(':').map(Number)
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM'
  const h = ((h24 + 11) % 12) + 1 // 0→12, 13→1, ...
  return { h, m: isNaN(m) ? 0 : m, period }
}

// 12h-Komponenten → 24h "HH:mm"
function to24h(h: number, m: number, period: 'AM' | 'PM'): string {
  let h24 = h % 12
  if (period === 'PM') h24 += 12
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function CustomEventForm({ onDone, editing }: { onDone: () => void; editing?: CustomEvent }) {
  const isEdit = !!editing
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().split('T')[0])
  const [type, setType] = useState<ShowType>(editing?.type ?? 'RAW')
  const [title, setTitle] = useState(editing?.title ?? '')
  const [venue, setVenue] = useState(editing?.venue ?? '')
  const [city, setCity] = useState(editing?.city ?? '')
  const [localTime, setLocalTime] = useState(editing?.localTime ?? '20:00')
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h')
  const [tz, setTz] = useState(editing?.tz ?? defaultTz())
  const [error, setError] = useState('')

  const tp = to12h(localTime)
  const setFrom12h = (h: number, m: number, p: 'AM' | 'PM') =>
    setLocalTime(to24h(Math.max(1, Math.min(12, h)), Math.max(0, Math.min(59, m)), p))

  function handleSave() {
    if (!city.trim()) { setError('Stadt ist Pflicht.'); return }
    if (!isValidTz(tz.trim())) {
      setError('Ungültige Zeitzone. Beispiel: Europe/Berlin oder America/New_York.')
      return
    }
    const payload = {
      date,
      type,
      title: title.trim() || undefined,
      venue: venue.trim() || undefined,
      city: city.trim(),
      tz: tz.trim(),
      localTime,
    }
    if (isEdit && editing) updateCustomEvent(editing.id, payload)
    else addCustomEvent(payload)
    onDone()
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-zinc-100">{isEdit ? 'Event bearbeiten' : 'Eigenes Event anlegen'}</h3>
        <button onClick={onDone} className="text-xs text-zinc-500 hover:text-zinc-300 min-h-[44px] min-w-[44px]">Abbrechen</button>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Typ</label>
        <div className="flex gap-2 flex-wrap">
          {SHOW_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-xs px-3 py-2 min-h-[44px] rounded-xl border transition-colors ${
                type === t ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'border-zinc-700 text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Datum</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-zinc-500">Lokale Startzeit</label>
            <div className="flex bg-zinc-950 border border-zinc-700 rounded-lg overflow-hidden text-[10px]">
              <button
                type="button"
                onClick={() => setTimeFormat('24h')}
                className={`px-2 py-0.5 transition-colors ${
                  timeFormat === '24h' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                24h
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat('12h')}
                className={`px-2 py-0.5 transition-colors ${
                  timeFormat === '12h' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                12h
              </button>
            </div>
          </div>
          {timeFormat === '24h' ? (
            <input
              type="time"
              value={localTime}
              onChange={e => setLocalTime(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
            />
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={12}
                value={tp.h}
                onChange={e => setFrom12h(parseInt(e.target.value) || 1, tp.m, tp.period)}
                className="w-12 bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-2 text-sm text-zinc-50 text-center outline-none focus:border-zinc-500"
              />
              <span className="text-zinc-500">:</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={String(tp.m).padStart(2, '0')}
                onChange={e => setFrom12h(tp.h, parseInt(e.target.value) || 0, tp.period)}
                className="w-12 bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-2 text-sm text-zinc-50 text-center outline-none focus:border-zinc-500"
              />
              <div className="flex bg-zinc-950 border border-zinc-700 rounded-xl overflow-hidden ml-1">
                <button
                  type="button"
                  onClick={() => setFrom12h(tp.h, tp.m, 'AM')}
                  className={`px-2 py-2 text-xs transition-colors ${
                    tp.period === 'AM' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setFrom12h(tp.h, tp.m, 'PM')}
                  className={`px-2 py-2 text-xs transition-colors ${
                    tp.period === 'PM' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          )}
          <p className="text-[10px] text-zinc-600 mt-1">Gespeichert: {localTime} (24h)</p>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Titel (optional, z.B. &quot;SummerSlam&quot;)</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="optional"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Venue (optional)</label>
        <input
          type="text"
          value={venue}
          onChange={e => setVenue(e.target.value)}
          placeholder="z.B. Madison Square Garden"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Stadt (Pflicht)</label>
        <input
          type="text"
          value={city}
          onChange={e => { setCity(e.target.value); setError('') }}
          placeholder="z.B. New York, NY"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Zeitzone</label>
        <select
          value={tz}
          onChange={e => { setTz(e.target.value); setError('') }}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 min-h-[44px]"
        >
          {TZ_OPTIONS.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.zones.map(z => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="text-[10px] text-zinc-600 mt-1">
          Zeitzone des Veranstaltungsorts — die deutsche Live-Zeit wird daraus berechnet.
        </p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onDone}
          className="flex-1 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 rounded-xl py-3 text-sm min-h-[44px] transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-[#DC0000] hover:bg-red-700 text-white rounded-xl py-3 text-sm font-medium min-h-[44px] transition-colors"
        >
          Speichern
        </button>
      </div>
    </div>
  )
}
