'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [persons, setPersons] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  // Name der Person, bei der der Lösch-Bestätigungs-Toggle offen ist
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadPersons() {
    const res = await fetch('/api/persons')
    const data: string[] = await res.json()
    setPersons(data)
  }

  useEffect(() => {
    loadPersons()
  }, [])

  async function handleAdd() {
    const name = newName.trim()
    if (!name) {
      setAddError('Bitte einen Namen eingeben.')
      return
    }
    if (persons.map(p => p.toLowerCase()).includes(name.toLowerCase())) {
      setAddError('Diese Person existiert bereits.')
      return
    }
    setAdding(true)
    setAddError('')
    await fetch('/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setNewName('')
    await loadPersons()
    setAdding(false)
  }

  async function handleDelete(name: string) {
    setDeleting(true)
    await fetch('/api/persons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setConfirmDelete(null)
    setDeleting(false)
    await loadPersons()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/shows" className="text-gray-400 text-sm">
          ← Zurück
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Personen</h1>
      </div>

      {/* Aktuelle Personen */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <p className="text-xs text-gray-500 mb-3">Aktuelle Personen</p>

        {persons.length === 0 && (
          <p className="text-sm text-gray-400 py-2">Noch keine Personen vorhanden.</p>
        )}

        <ul className="space-y-1">
          {persons.map(person => (
            <li key={person}>
              {/* Normale Zeile */}
              {confirmDelete !== person ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-800 font-medium">{person}</span>
                  <button
                    onClick={() => setConfirmDelete(person)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Entfernen
                  </button>
                </div>
              ) : (
                /* Bestätigungs-Toggle */
                <div className="flex items-center justify-between py-2 gap-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{person}</span> wirklich entfernen?
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500"
                    >
                      Nein
                    </button>
                    <button
                      onClick={() => handleDelete(person)}
                      disabled={deleting}
                      className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                      {deleting ? 'Löschen...' : 'Ja'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Person hinzufügen */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs text-gray-500 mb-3">Person hinzufügen</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => { setNewName(e.target.value); setAddError('') }}
            onKeyDown={handleKeyDown}
            placeholder="Name"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="bg-gray-900 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {adding ? '...' : 'Hinzufügen'}
          </button>
        </div>
        {addError && (
          <p className="text-xs text-red-500 mt-2">{addError}</p>
        )}
      </div>
    </div>
  )
}
