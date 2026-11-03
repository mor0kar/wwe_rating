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
  const byShow = new Map<number, {
    ratings: Record<string, number>
    notes: Record<string, string | null>
    moments: Record<string, string | null>
  }>()
  for (const r of ratings) {
    let entry = byShow.get(r.show_id)
    if (!entry) {
      entry = { ratings: {}, notes: {}, moments: {} }
      byShow.set(r.show_id, entry)
    }
    entry.ratings[r.person_name] = Number(r.score)
    entry.notes[r.person_name] = r.note ?? null
    entry.moments[r.person_name] = r.moment ?? null
  }

  const data = shows.map(show => ({
    ...show,
    ratings: byShow.get(show.id)?.ratings ?? {},
    notes: byShow.get(show.id)?.notes ?? {},
    moments: byShow.get(show.id)?.moments ?? {},
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
    moments,
  }: {
    type: string
    date: string
    title?: string
    comment?: string
    ratings: Record<string, number>
    notes?: Record<string, string>
    moments?: Record<string, 'up' | 'down'>
  } = await req.json()

  if (!type || !date || Object.values(ratings ?? {}).some(score => typeof score !== 'number' || isNaN(score))) {
    return NextResponse.json({ error: 'invalid show' }, { status: 400 })
  }

  const toRows = (showId: number) => Object.entries(ratings ?? {})
    .filter(([, score]) => score !== null && score !== undefined)
    .map(([person, score]) => ({
      show_id: showId,
      person_name: person,
      score,
      note: notes?.[person] ?? null,
      moment: moments?.[person] ?? null,
    }))

  const result = await sql.begin(async tx => {
    // Tragen zwei Leute parallel dieselbe Folge ein (Typ + Datum), darf keine
    // Doppel-Show entstehen: Advisory-Lock serialisiert, die zweite Eintragung
    // ergänzt die bestehende Show. Vorhandene Bewertungen bleiben unangetastet.
    await tx`SELECT pg_advisory_xact_lock(hashtext(${`${type}|${date}`}))`
    const [existing] = await tx`SELECT id FROM shows WHERE type = ${type} AND date = ${date} ORDER BY id LIMIT 1`
    if (existing) {
      const rows = toRows(existing.id)
      if (rows.length) {
        await tx`
          INSERT INTO ratings ${tx(rows, 'show_id', 'person_name', 'score', 'note', 'moment')}
          ON CONFLICT (show_id, person_name) DO NOTHING
        `
      }
      return { id: existing.id as number, merged: true }
    }

    const [show] = await tx`
      INSERT INTO shows (type, date, title, comment)
      VALUES (${type}, ${date}, ${title || ''}, ${comment || ''})
      RETURNING id
    `
    // Alle Ratings in einem Statement einfügen (statt einzeln pro Person)
    const rows = toRows(show.id)
    if (rows.length) {
      await tx`INSERT INTO ratings ${tx(rows, 'show_id', 'person_name', 'score', 'note', 'moment')}`
    }
    return { id: show.id as number, merged: false }
  })

  return NextResponse.json({ ok: true, ...result })
}
