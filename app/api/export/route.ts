import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

// CSV-Zelle escapen: bei Sonderzeichen quoten, Anführungszeichen verdoppeln
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  return /[",\r\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format')
  const stamp = new Date().toISOString().slice(0, 10)

  // JSON: vollständiges Backup aller Tabellen
  if (format === 'json') {
    const [shows, ratings, persons] = await Promise.all([
      sql`SELECT * FROM shows ORDER BY date, id`,
      sql`SELECT * FROM ratings ORDER BY show_id, person_name`,
      sql`SELECT * FROM persons ORDER BY id`,
    ])
    const body = JSON.stringify(
      { exportedAt: new Date().toISOString(), shows, ratings, persons },
      null,
      2,
    )
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="wwe-rater-backup-${stamp}.json"`,
      },
    })
  }

  // CSV: jede Bewertung als Zeile; Shows ohne Bewertung erscheinen mit leeren Feldern
  const rows = (await sql`
    SELECT s.id AS show_id, s.date, s.type, s.title, s.comment,
           r.person_name, r.score, r.note
    FROM shows s
    LEFT JOIN ratings r ON r.show_id = s.id
    ORDER BY s.date, s.id, r.person_name
  `) as unknown as Array<{
    show_id: number
    date: string
    type: string
    title: string | null
    comment: string | null
    person_name: string | null
    score: string | null
    note: string | null
  }>

  const header = ['show_id', 'date', 'type', 'title', 'comment', 'person', 'score', 'note']
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(
      [r.show_id, r.date, r.type, r.title, r.comment, r.person_name, r.score, r.note]
        .map(csvCell)
        .join(','),
    )
  }
  // BOM voranstellen, damit Excel Umlaute korrekt als UTF-8 liest
  const csv = '﻿' + lines.join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="wwe-rater-${stamp}.csv"`,
    },
  })
}
