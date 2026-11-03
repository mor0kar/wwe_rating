import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// Name prüfen: nicht leer, max. 100 Zeichen (VARCHAR(100) im Schema)
function parseName(body: unknown): string | null {
  const name = (body as { name?: unknown } | null)?.name
  if (typeof name !== 'string') return null
  const trimmed = name.trim()
  return trimmed && trimmed.length <= 100 ? trimmed : null
}

export async function GET() {
  const persons = await sql`SELECT name FROM persons ORDER BY id`
  return NextResponse.json(persons.map(p => p.name))
}

export async function POST(req: NextRequest) {
  const name = parseName(await req.json().catch(() => null))
  if (!name) return NextResponse.json({ error: 'invalid name' }, { status: 400 })
  await sql`INSERT INTO persons (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const name = parseName(await req.json().catch(() => null))
  if (!name) return NextResponse.json({ error: 'invalid name' }, { status: 400 })
  await sql`DELETE FROM persons WHERE name = ${name}`
  return NextResponse.json({ ok: true })
}
