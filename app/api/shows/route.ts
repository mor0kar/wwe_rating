import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const shows = type && type !== 'all'
    ? await sql`SELECT * FROM shows WHERE type = ${type} ORDER BY date DESC`
    : await sql`SELECT * FROM shows ORDER BY date DESC`

  const ratings = await sql`SELECT * FROM ratings`

  const data = shows.map(show => ({
    ...show,
    ratings: Object.fromEntries(
      ratings
        .filter(r => r.show_id === show.id)
        .map(r => [r.person_name, Number(r.score)])
    ),
    notes: Object.fromEntries(
      ratings
        .filter(r => r.show_id === show.id)
        .map(r => [r.person_name, r.note ?? null])
    ),
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

  for (const [person, score] of Object.entries(ratings)) {
    if (score === null || score === undefined) continue
    const note = notes?.[person] ?? null
    await sql`
      INSERT INTO ratings (show_id, person_name, score, note)
      VALUES (${show.id}, ${person}, ${score}, ${note})
    `
  }

  return NextResponse.json({ ok: true, id: show.id })
}
