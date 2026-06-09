// lib/customEvents.ts
// Benutzerdefinierte Kalender-Events (pro Browser, localStorage).
// Werden zusätzlich zu den statisch in calendar.ts gepflegten Events angezeigt
// und können wieder gelöscht werden.

'use client'
import { useEffect, useState } from 'react'
import type { CalendarEvent } from './calendar'

const KEY = 'wweRater.customEvents'
const SYNC_EVENT = 'wwe-custom-events-change'

export type CustomEvent = CalendarEvent & {
  // ID zum Wiederfinden/Löschen. Wird beim Anlegen erzeugt.
  id: string
  custom: true
}

function read(): CustomEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function write(events: CustomEvent[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(events))
  window.dispatchEvent(new Event(SYNC_EVENT))
}

export function addCustomEvent(ev: Omit<CalendarEvent, never>): CustomEvent {
  const id = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
  const created: CustomEvent = { ...ev, id, custom: true }
  write([...read(), created])
  return created
}

// Bestehendes Custom-Event aktualisieren (ID + custom-Flag bleiben erhalten).
export function updateCustomEvent(id: string, ev: Omit<CalendarEvent, never>) {
  write(read().map(e => (e.id === id ? { ...ev, id, custom: true } : e)))
}

export function removeCustomEvent(id: string) {
  write(read().filter(e => e.id !== id))
}

export function useCustomEvents() {
  const [events, setEvents] = useState<CustomEvent[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setEvents(read())
    setReady(true)
    function sync() { setEvents(read()) }
    window.addEventListener(SYNC_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { events, ready }
}
