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

  const { type, date, title, ratings } = await req.json()

  await sql`
    UPDATE shows
    SET type  = ${type},
        date  = ${date},
        title = ${title ?? ''}
    WHERE id = ${showId}
  `

  // Bestehende Ratings löschen und neu einsetzen
  await sql`DELETE FROM ratings WHERE show_id = ${showId}`

  for (const [person, score] of Object.entries(ratings as Record<string, number>)) {
    if (score === null || score === undefined) continue
    await sql`
      INSERT INTO ratings (show_id, person_name, score)
      VALUES (${showId}, ${person}, ${score})
    `
  }

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
