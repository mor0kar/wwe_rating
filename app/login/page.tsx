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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">WWE Rater 🏆</h1>
        <p className="text-sm text-gray-500 mb-8">PIN eingeben um reinzukommen</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg tracking-widest text-center outline-none focus:border-gray-400"
            autoFocus
          />
          {error && <p className="text-sm text-red-500 text-center">Falscher PIN</p>}
          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full bg-gray-900 text-white rounded-xl py-3 font-medium disabled:opacity-50"
          >
            {loading ? 'Prüfen...' : 'Rein'}
          </button>
        </form>
      </div>
    </div>
  )
}
