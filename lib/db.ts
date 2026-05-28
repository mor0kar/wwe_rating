import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 15,
})

export default sql
