import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { missingMomentNote } from '@/lib/score'

// PATCH /api/shows/[id] — Show-Metadaten und Ratings gezielt aktualisieren.
// Merge statt Ersetzen: Es werden nur mitgeschickte Felder und Personen angefasst.
// So löschen sich zwei gleichzeitig offene Editoren nicht gegenseitig die
// Bewertungen (früher: alle Ratings löschen + Client-Stand neu einfügen).
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
    comment,
    ratings = {},
    notes,
    moments,
    removed = [],
  }: {
    type?: string
    date?: string
    title?: string
    comment?: string
    ratings?: Record<string, number>   // Upsert pro Person
    notes?: Record<string, string>
    moments?: Record<string, 'up' | 'down'>
    removed?: string[]                  // explizit entfernte Personen
  } = await req.json()

  if (Object.values(ratings).some(score => typeof score !== 'number' || isNaN(score))) {
    return NextResponse.json({ error: 'scores must be numbers' }, { status: 400 })
  }
  if (Object.keys(ratings).some(p => missingMomentNote(moments?.[p], notes?.[p]))) {
    return NextResponse.json({ error: 'moment needs note' }, { status: 400 })
  }

  // Metadaten nur aktualisieren, wenn sie mitgeschickt wurden
  const meta: Record<string, string> = {}
  if (type !== undefined) meta.type = type
  if (date !== undefined) meta.date = date
  if (title !== undefined) meta.title = title
  if (comment !== undefined) meta.comment = comment

  const rows = Object.entries(ratings).map(([person, score]) => ({
    show_id: showId,
    person_name: person,
    score,
    note: notes?.[person] ?? null,
    moment: moments?.[person] ?? null,
  }))

  await sql.begin(async tx => {
    if (Object.keys(meta).length) {
      await tx`UPDATE shows SET ${tx(meta)} WHERE id = ${showId}`
    }
    if (removed.length) {
      await tx`DELETE FROM ratings WHERE show_id = ${showId} AND person_name IN ${tx(removed)}`
    }
    if (rows.length) {
      await tx`
        INSERT INTO ratings ${tx(rows, 'show_id', 'person_name', 'score', 'note', 'moment')}
        ON CONFLICT (show_id, person_name)
        DO UPDATE SET score  = EXCLUDED.score,
                      note   = EXCLUDED.note,
                      moment = EXCLUDED.moment
      `
    }
  })

  // Aktuellen Stand zurückgeben (inkl. Bewertungen anderer), damit der Client
  // nicht seinen eigenen, evtl. veralteten Stand anzeigt.
  const [show] = await sql`SELECT * FROM shows WHERE id = ${showId}`
  if (!show) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const current = await sql`SELECT person_name, score, note, moment FROM ratings WHERE show_id = ${showId}`
  const result = {
    ...show,
    ratings: Object.fromEntries(current.map(r => [r.person_name, Number(r.score)])),
    notes: Object.fromEntries(current.map(r => [r.person_name, r.note ?? null])),
    moments: Object.fromEntries(current.map(r => [r.person_name, r.moment ?? null])),
  }

  return NextResponse.json({ ok: true, show: result })
}

// POST /api/shows/[id] — Einzelnes Rating einer Person hinzufügen oder aktualisieren
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const showId = parseInt(id, 10)
  if (isNaN(showId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { person, score, note, moment }: {
    person: string
    score: number
    note?: string
    moment?: 'up' | 'down' | null
  } = await req.json()

  if (!person || typeof person !== 'string') {
    return NextResponse.json({ error: 'person is required' }, { status: 400 })
  }
  if (typeof score !== 'number') {
    return NextResponse.json({ error: 'score must be a number' }, { status: 400 })
  }
  if (missingMomentNote(moment, note)) {
    return NextResponse.json({ error: 'moment needs note' }, { status: 400 })
  }

  await sql`
    INSERT INTO ratings (show_id, person_name, score, note, moment)
    VALUES (${showId}, ${person}, ${score}, ${note ?? null}, ${moment ?? null})
    ON CONFLICT (show_id, person_name)
    DO UPDATE SET score  = EXCLUDED.score,
                  note   = EXCLUDED.note,
                  moment = EXCLUDED.moment
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
