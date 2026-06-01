'use client'
import { useEffect, useState } from 'react'
import { calendarStatus } from '@/lib/calendar'

const KEY = 'calReminderDismiss'
const SNOOZE_DAYS = 7

// Erinnerung, den Kalender zu aktualisieren, wenn er zur Neige geht.
// Dismissbar — schläft 7 Tage, taucht danach wieder auf, bis die Liste
// gepflegt wurde (dann ändert sich lastEventDate und der Snooze verfällt).
export default function CalendarReminder() {
  const [status, setStatus] = useState<ReturnType<typeof calendarStatus> | null>(null)

  useEffect(() => {
    const s = calendarStatus()
    if (!s.needsRefresh) return
    let dismissed: { lastEvent: string; at: number } | null = null
    try {
      dismissed = JSON.parse(localStorage.getItem(KEY) || 'null')
    } catch {}
    const snoozed =
      dismissed &&
      dismissed.lastEvent === s.lastEventDate &&
      Date.now() - dismissed.at < SNOOZE_DAYS * 86400000
    if (!snoozed) setStatus(s)
  }, [])

  if (!status) return null

  function dismiss() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ lastEvent: status!.lastEventDate, at: Date.now() }))
    } catch {}
    setStatus(null)
  }

  const lastDate = new Date(status.lastEventDate + 'T12:00:00').toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const runwayText =
    status.daysUntilLastEvent <= 0
      ? 'Der Kalender ist abgelaufen.'
      : `Nur noch ${status.daysUntilLastEvent} Tage bis zum letzten Termin (${lastDate}).`

  return (
    <div className="max-w-6xl mx-auto px-4 mb-6">
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5">🗓️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-200">Kalender-Update fällig</p>
          <p className="text-xs text-amber-200/80 mt-0.5">
            {runwayText} Hol die neuen Show-Termine von der WWE-Eventseite und gib sie dem Assistenten zum Einpflegen.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <a
              href="https://www.wwe.com/events/results/all-events/all-dates/51.3237/6.6027/Current%20location/DE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-wide bg-amber-500 hover:bg-amber-400 text-amber-950 px-3 py-1.5 rounded-lg transition-colors"
            >
              Zu WWE.com →
            </a>
            <button
              onClick={dismiss}
              className="text-xs text-amber-200/70 hover:text-amber-100 px-2 py-1.5 transition-colors"
            >
              Später (7 Tage)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
