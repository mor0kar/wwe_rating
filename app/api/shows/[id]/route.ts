import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// PATCH /api/shows/[id] — Show-Metadaten und Ratings aktualisieren
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const showId = parseInt(id, 10)
  if (isNaN(showId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const {
    type,
    date,
    title,
    ratings,
    notes,
  }: {
    type: string
    date: string
    title?: string
    ratings: Record<string, number>
    notes?: Record<string, string>
  } = await req.json()

  await sql`
    UPDATE shows
    SET type  = ${type},
        date  = ${date},
        title = ${title ?? ''}
    WHERE id = ${showId}
  `

  // Bestehende Ratings löschen und neu einsetzen
  await sql`DELETE FROM ratings WHERE show_id = ${showId}`

  for (const [person, score] of Object.entries(ratings)) {
    if (score === null || score === undefined) continue
    const note = notes?.[person] ?? null
    await sql`
      INSERT INTO ratings (show_id, person_name, score, note)
      VALUES (${showId}, ${person}, ${score}, ${note})
    `
  }

  return NextResponse.json({ ok: true })
}

// POST /api/shows/[id] — Einzelnes Rating einer Person hinzufügen oder aktualisieren
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const showId = parseInt(id, 10)
  if (isNaN(showId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { person, score, note }: { person: string; score: number; note?: string } = await req.json()

  if (!person || typeof person !== 'string') {
    return NextResponse.json({ error: 'person is required' }, { status: 400 })
  }
  if (typeof score !== 'number') {
    return NextResponse.json({ error: 'score must be a number' }, { status: 400 })
  }

  await sql`
    INSERT INTO ratings (show_id, person_name, score, note)
    VALUES (${showId}, ${person}, ${score}, ${note ?? null})
    ON CONFLICT (show_id, person_name)
    DO UPDATE SET score = EXCLUDED.score,
                  note  = EXCLUDED.note
  `

  return NextResponse.json({ ok: true })
}

// DELETE /api/shows/[id] — Show und alle zugehörigen Ratings entfernen
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const showId = parseInt(id, 10)
  if (isNaN(showId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  // ratings werden via ON DELETE CASCADE automatisch gelöscht
  await sql`DELETE FROM shows WHERE id = ${showId}`

  return NextResponse.json({ ok: true })
}
