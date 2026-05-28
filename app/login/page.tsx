'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      router.push('/shows')
    } else {
      setError(true)
      setPin('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🏆</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">WWE Rater</h1>
          <p className="text-sm text-gray-500 mt-1">Foffi · Jan · Björn · Curry</p>
        </div>

        {/* Login-Formular */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN eingeben"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-lg tracking-widest text-center outline-none focus:border-gray-400 transition-colors"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 text-center">
              Falscher PIN — versuch's nochmal
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-medium text-base disabled:opacity-40 transition-opacity"
          >
            {loading ? 'Prüfen...' : 'Rein'}
          </button>
        </form>
      </div>
    </div>
  )
}
