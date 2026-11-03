import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Fake-postgres.js: Abfragen sind lazy (starten erst bei .then) und hängen auf
// Wunsch für immer — wie eine tote Pooler-Verbindung. end() lässt hängende
// Abfragen scheitern, wie postgres.js mit CONNECTION_DESTROYED.
const fake = vi.hoisted(() => {
  const state = { hang: false, clients: [] as ReturnType<typeof create>[] }

  function create() {
    const pending: ((e: Error) => void)[] = []
    let started = 0
    const run = <T>(value: T) => {
      started++
      return state.hang ? new Promise<T>((_, reject) => { pending.push(reject) }) : Promise.resolve(value)
    }
    const client = Object.assign(
      (strings: unknown, ...args: unknown[]) =>
        Array.isArray((strings as TemplateStringsArray).raw)
          ? { then: (res?: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => run([{ ok: 1 }]).then(res, rej) }
          : { helper: [strings, ...args] },
      {
        begin: vi.fn((cb: (tx: string) => Promise<unknown>) => run(null).then(() => cb('tx'))),
        end: vi.fn(async () => { pending.splice(0).forEach(reject => reject(new Error('CONNECTION_DESTROYED'))) }),
        started: () => started,
      },
    )
    state.clients.push(client)
    return client
  }

  return { state, create }
})

vi.mock('postgres', () => ({ default: fake.create }))

async function load() {
  vi.resetModules()
  return import('./db')
}

beforeEach(() => {
  fake.state.hang = false
  fake.state.clients.length = 0
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('db-Proxy leitet an den aktuellen Client weiter', () => {
  it('Abfragen, Helper und Transaktionen funktionieren wie gewohnt', async () => {
    const { default: sql } = await load()
    expect(await sql`SELECT 1`).toEqual([{ ok: 1 }])
    expect(sql(['a', 'b'] as never)).toEqual({ helper: [['a', 'b']] })
    expect(await sql.begin(async tx => `done:${tx}`)).toBe('done:tx')
  })

  it('Abfragen bleiben lazy — erst await startet sie', async () => {
    const { default: sql } = await load()
    const query = sql`SELECT 1`
    expect(fake.state.clients[0].started()).toBe(0)
    await query
    expect(fake.state.clients[0].started()).toBe(1)
  })
})

describe('Watchdog gegen hängende Verbindungen', () => {
  it('hängende Abfrage scheitert nach dem Timeout, danach frische Verbindung', async () => {
    vi.useFakeTimers()
    const { default: sql, QUERY_TIMEOUT_MS } = await load()
    fake.state.hang = true

    const result = sql`SELECT 1`.then(() => 'ok', (e: Error) => e.message)
    await vi.advanceTimersByTimeAsync(QUERY_TIMEOUT_MS)

    expect(await result).toBe('CONNECTION_DESTROYED')
    expect(fake.state.clients[0].end).toHaveBeenCalledTimes(1)
    expect(fake.state.clients).toHaveLength(2)

    fake.state.hang = false
    expect(await sql`SELECT 1`).toEqual([{ ok: 1 }])
    expect(fake.state.clients[1].started()).toBe(1)
  })

  it('mehrere hängende Abfragen bauen nur einmal neu auf', async () => {
    vi.useFakeTimers()
    const { default: sql, QUERY_TIMEOUT_MS } = await load()
    fake.state.hang = true

    const results = Promise.allSettled([sql`SELECT 1`, sql`SELECT 2`, sql`SELECT 3`])
    await vi.advanceTimersByTimeAsync(QUERY_TIMEOUT_MS)

    expect((await results).every(r => r.status === 'rejected')).toBe(true)
    expect(fake.state.clients).toHaveLength(2)
  })

  it('hängende Transaktion scheitert ebenfalls nach dem Timeout', async () => {
    vi.useFakeTimers()
    const { default: sql, QUERY_TIMEOUT_MS } = await load()
    fake.state.hang = true

    const result = sql.begin(async () => 'nie').then(() => 'ok', (e: Error) => e.message)
    await vi.advanceTimersByTimeAsync(QUERY_TIMEOUT_MS)

    expect(await result).toBe('CONNECTION_DESTROYED')
    expect(fake.state.clients).toHaveLength(2)
  })

  it('schnelle Abfragen lösen keinen Neuaufbau aus', async () => {
    vi.useFakeTimers()
    const { default: sql, QUERY_TIMEOUT_MS } = await load()
    await sql`SELECT 1`
    await vi.advanceTimersByTimeAsync(QUERY_TIMEOUT_MS * 2)
    expect(fake.state.clients).toHaveLength(1)
    expect(fake.state.clients[0].end).not.toHaveBeenCalled()
  })
})
