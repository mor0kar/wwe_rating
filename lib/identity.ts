// lib/identity.ts
// Lokale "Wer bin ich?"-Identität + Spoiler-Toggle. Pro Browser im localStorage.
// Kein Account-System — der PIN-Login schützt die App nach außen; dieser
// Mechanismus schützt den User vor seinen eigenen Spoilern.

'use client'
import { useEffect, useState } from 'react'

const KEY_ME = 'wweRater.me'
const KEY_HIDE = 'wweRater.hideUntilRated'

// Event-Name für same-tab Sync (storage-Events feuern nur cross-tab).
const SYNC_EVENT = 'wwe-identity-change'

function readMe(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(KEY_ME)
}

function readHide(): boolean {
  if (typeof window === 'undefined') return true
  const v = window.localStorage.getItem(KEY_HIDE)
  // Default: an. Nur explizites "false" deaktiviert.
  return v !== 'false'
}

export function setMe(name: string | null) {
  if (typeof window === 'undefined') return
  if (name) window.localStorage.setItem(KEY_ME, name)
  else window.localStorage.removeItem(KEY_ME)
  window.dispatchEvent(new Event(SYNC_EVENT))
}

export function setHideUntilRated(hide: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY_HIDE, hide ? 'true' : 'false')
  window.dispatchEvent(new Event(SYNC_EVENT))
}

// React-Hook. Re-rendert wenn sich Identität/Toggle ändern (auch innerhalb des
// gleichen Tabs, via Custom-Event).
export function useIdentity() {
  const [me, setMeState] = useState<string | null>(null)
  const [hideUntilRated, setHideState] = useState<boolean>(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMeState(readMe())
    setHideState(readHide())
    setReady(true)

    function sync() {
      setMeState(readMe())
      setHideState(readHide())
    }
    window.addEventListener(SYNC_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { me, hideUntilRated, ready }
}
