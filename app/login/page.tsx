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
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden">
      {/* Hintergrund-Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-20" />
      {/* Radialer Rot-Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(127,0,0,0.25)_0%,transparent_70%)]" />

      <div className="relative w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#DC0000] rounded-2xl mb-5 shadow-[0_0_40px_rgba(220,0,0,0.5)]">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white text-glow-red">
            Squared Circle Ratings
          </h1>
          <p className="text-zinc-500 mt-2 text-sm uppercase tracking-widest">
            Foffi · Jan · Björn · Curry
          </p>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN eingeben"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-lg tracking-widest text-center text-zinc-50 outline-none focus:border-red-600 transition-colors"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-400 text-center">
              Falscher PIN — versuch&apos;s nochmal
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full bg-[#DC0000] hover:bg-red-700 text-white rounded-xl py-3.5 font-bold text-base uppercase tracking-widest disabled:opacity-40 transition-all"
          >
            {loading ? 'Prüfen...' : 'EINLOGGEN'}
          </button>
        </form>
      </div>
    </div>
  )
}
