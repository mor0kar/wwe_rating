'use client'
import { useState } from 'react'
import { getShowLogo, BADGE } from '@/lib/showStyle'

// Zentrales Show-Logo: rendert das Franchise-/Show-Logo und fällt bei Ladefehler
// (z.B. Wikimedia/wwe.com blockt oder URL kippt) sauber auf den Text-Badge zurück.
// Feste Höhe verhindert das Springen beim Laden; lazy + kleine Quell-Thumbnails (siehe showStyle).
export default function ShowLogo({
  type,
  title,
  heightClass = 'h-7',
  placeholder = 'emblem',
  badgeClass = 'text-xs font-medium px-2 py-0.5',
  className = '',
}: {
  type: string
  title?: string
  heightClass?: string
  placeholder?: 'emblem' | 'wordmark' | 'none'
  badgeClass?: string
  className?: string
}) {
  const url = getShowLogo(type, title, placeholder)
  const [failed, setFailed] = useState(false)

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={title || type}
        className={`${heightClass} w-auto object-contain shrink-0 ${className}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span className={`rounded-md shrink-0 ${badgeClass} ${BADGE[type] || 'bg-zinc-800 text-zinc-300'} ${className}`}>
      {type}
    </span>
  )
}
