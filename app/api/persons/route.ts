import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const persons = await sql`SELECT name FROM persons ORDER BY id`
  return NextResponse.json(persons.map(p => p.name))
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  await sql`INSERT INTO persons (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { name } = await req.json()
  await sql`DELETE FROM persons WHERE name = ${name}`
  return NextResponse.json({ ok: true })
}
