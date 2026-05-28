import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
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
