'use client'
import { useEffect, useState } from 'react'

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
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50 uppercase tracking-wide">Einstellungen</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Personen verwalten</p>
      </div>

      {/* Aktuelle Personen */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
        <p className="text-xs text-zinc-500 mb-3">Aktuelle Personen</p>

        {persons.length === 0 && (
          <p className="text-sm text-zinc-500 py-2">Noch keine Personen vorhanden.</p>
        )}

        <ul className="space-y-1">
          {persons.map(person => (
            <li key={person}>
              {/* Normale Zeile */}
              {confirmDelete !== person ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-100 font-medium">{person}</span>
                  <button
                    onClick={() => setConfirmDelete(person)}
                    className="text-xs text-red-400"
                  >
                    Entfernen
                  </button>
                </div>
              ) : (
                /* Bestätigungs-Toggle */
                <div className="flex items-center justify-between py-2 gap-2">
                  <p className="text-sm text-zinc-400">
                    <span className="font-medium text-zinc-100">{person}</span> wirklich entfernen?
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs px-3 py-1.5 border border-zinc-700 rounded-lg text-zinc-500"
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs text-zinc-500 mb-3">Person hinzufügen</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => { setNewName(e.target.value); setAddError('') }}
            onKeyDown={handleKeyDown}
            placeholder="Name"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="bg-[#DC0000] hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {adding ? '...' : 'Hinzufügen'}
          </button>
        </div>
        {addError && (
          <p className="text-xs text-red-400 mt-2">{addError}</p>
        )}
      </div>
    </div>
  )
}
