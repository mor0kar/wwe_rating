import postgres from 'postgres'

// Länger darf keine Abfrage (inkl. Verbindungsaufbau) dauern — unsere Queries
// brauchen Millisekunden, alles darüber ist eine tote Verbindung.
export const QUERY_TIMEOUT_MS = 10_000

function connect() {
  return postgres(process.env.POSTGRES_URL!, {
    ssl: 'require',
    // Supabase-Pooler (Transaction-Mode, Port 6543) unterstützt keine Prepared
    // Statements — sonst sporadische Fehler, sobald mehrere Instanzen parallel laufen.
    prepare: false,
    // Kein Array-Typ-Abruf beim Verbindungsaufbau: wir nutzen keine SQL-Arrays,
    // spart einen Roundtrip pro neuer Verbindung (Cold Start).
    fetch_types: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    types: {
      date: {
        to: 1082,
        from: [1082],
        serialize: (x: string) => x,
        parse: (x: string) => x,
      },
    },
  })
}

type Sql = ReturnType<typeof connect>
type Fn = (...args: unknown[]) => unknown
type Thenable = {
  then: (onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => Promise<unknown>
}

let client = connect()

// Watchdog: Vercel (Fluid Compute) friert Instanzen zwischen Requests ein, die
// offene Pooler-Verbindung kann dabei unbemerkt sterben. postgres.js kennt kein
// Query-Timeout und wartet dann ewig — wegen max: 1 hängen alle weiteren Requests
// der Instanz dahinter, bis Vercel nach 300 s abbricht ("Shows laden ewig").
// Dauert eine Abfrage zu lange, wird der Client verworfen: die hängende Abfrage
// schlägt sofort fehl, der nächste Request baut eine frische Verbindung auf.
function watch(owner: Sql, run: () => Promise<unknown>): Promise<unknown> {
  const timer = setTimeout(() => {
    if (owner !== client) return
    console.error(`DB-Abfrage hängt > ${QUERY_TIMEOUT_MS} ms — Verbindung wird neu aufgebaut`)
    client = connect()
    owner.end({ timeout: 0 }).catch(() => {})
  }, QUERY_TIMEOUT_MS)
  return run().finally(() => clearTimeout(timer))
}

// Stellvertreter für den jeweils aktuellen Client — Aufrufer nutzen `sql` wie gewohnt.
const sql = new Proxy((() => {}) as unknown as Sql, {
  apply(_target, _this, args: unknown[]) {
    const owner = client
    const result = (owner as unknown as Fn)(...args)
    // Nur echte Abfragen (Tagged Template) überwachen, keine Helper wie sql(rows).
    // Abfragen sind lazy: der Watchdog startet erst beim await (.then).
    if (!Array.isArray((args[0] as TemplateStringsArray | undefined)?.raw)) return result
    const query = result as Thenable
    const then = query.then
    query.then = (onFulfilled, onRejected) =>
      watch(owner, () => then.call(query)).then(onFulfilled, onRejected)
    return query
  },
  get(_target, prop) {
    const owner = client
    // Transaktion als Ganzes überwachen (der tx-Client darin ist nicht gewrappt)
    if (prop === 'begin') {
      return (...args: unknown[]) => watch(owner, () => (owner.begin as unknown as Fn)(...args) as Promise<unknown>)
    }
    return Reflect.get(owner, prop)
  },
})

export default sql
