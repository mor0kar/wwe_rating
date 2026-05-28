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
      ratings.filter(r => r.show_id === show.id).map(r => [r.person_name, Number(r.score)])
    ),
  }))

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { type, date, title, ratings } = await req.json()

  const [show] = await sql`
    INSERT INTO shows (type, date, title)
    VALUES (${type}, ${date}, ${title || ''})
    RETURNING *
  `

  for (const [person, score] of Object.entries(ratings as Record<string, number>)) {
    if (score === null || score === undefined) continue
    await sql`
      INSERT INTO ratings (show_id, person_name, score)
      VALUES (${show.id}, ${person}, ${score})
    `
  }

  return NextResponse.json({ ok: true, id: show.id })
}
