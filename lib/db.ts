import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  // Supabase-Pooler (Transaction-Mode, Port 6543) unterstützt keine Prepared
  // Statements — sonst sporadische Fehler, sobald mehrere Instanzen parallel laufen.
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 15,
  types: {
    date: {
      to: 1082,
      from: [1082],
      serialize: (x: string) => x,
      parse: (x: string) => x,
    },
  },
})

export default sql
