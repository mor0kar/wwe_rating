import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const shows = type && type !== 'all'
    ? await sql`SELECT * FROM shows WHERE type = ${type} ORDER BY date DESC`
    : await sql`SELECT * FROM shows ORDER BY date DESC`

  const ratings = await sql`SELECT * FROM ratings`

  // Ratings einmal nach show_id gruppieren (statt pro Show doppelt zu filtern)
  const byShow = new Map<number, { ratings: Record<string, number>; notes: Record<string, string | null> }>()
  for (const r of ratings) {
    let entry = byShow.get(r.show_id)
    if (!entry) {
      entry = { ratings: {}, notes: {} }
      byShow.set(r.show_id, entry)
    }
    entry.ratings[r.person_name] = Number(r.score)
    entry.notes[r.person_name] = r.note ?? null
  }

  const data = shows.map(show => ({
    ...show,
    ratings: byShow.get(show.id)?.ratings ?? {},
    notes: byShow.get(show.id)?.notes ?? {},
  }))

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const {
    type,
    date,
    title,
    comment,
    ratings,
    notes,
  }: {
    type: string
    date: string
    title?: string
    comment?: string
    ratings: Record<string, number>
    notes?: Record<string, string>
  } = await req.json()

  const [show] = await sql`
    INSERT INTO shows (type, date, title, comment)
    VALUES (${type}, ${date}, ${title || ''}, ${comment || ''})
    RETURNING *
  `

  // Alle Ratings in einem Statement einfügen (statt einzeln pro Person)
  const rows = Object.entries(ratings)
    .filter(([, score]) => score !== null && score !== undefined)
    .map(([person, score]) => ({
      show_id: show.id,
      person_name: person,
      score,
      note: notes?.[person] ?? null,
    }))
  if (rows.length) {
    await sql`INSERT INTO ratings ${sql(rows, 'show_id', 'person_name', 'score', 'note')}`
  }

  return NextResponse.json({ ok: true, id: show.id })
}
