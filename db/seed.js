// db/seed.js
// Run: node db/seed.js
// Imports your existing WWE ratings from Excel into Neon

import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' })

const SHOWS = [
  {"type":"RAW","date":"2026-01-05","title":"","ratings":{"Foffi":8.5,"Jan":8.0,"Björn":8.0,"Curry":8.5}},
  {"type":"SmackDown","date":"2026-01-09","title":"","ratings":{"Foffi":10.0,"Jan":9.9,"Björn":10.0,"Curry":10.0}},
  {"type":"RAW","date":"2026-01-12","title":"","ratings":{"Foffi":6.3,"Jan":7.0,"Björn":7.6}},
  {"type":"SmackDown","date":"2026-01-16","title":"","ratings":{"Foffi":2.8,"Jan":4.0,"Björn":4.25}},
  {"type":"RAW","date":"2026-01-19","title":"","ratings":{"Foffi":6.5,"Jan":6.5,"Björn":7.0}},
  {"type":"SmackDown","date":"2026-01-23","title":"","ratings":{"Foffi":4.0,"Jan":5.0,"Björn":5.8}},
  {"type":"SNM","date":"2026-01-24","title":"","ratings":{"Foffi":8.2,"Jan":3.8,"Björn":8.5}},
  {"type":"RAW","date":"2026-01-26","title":"","ratings":{"Foffi":6.5,"Jan":7.0,"Björn":7.0}},
  {"type":"SmackDown","date":"2026-01-30","title":"","ratings":{"Foffi":5.2,"Jan":5.0,"Björn":5.3}},
  {"type":"PLE","date":"2026-01-31","title":"Royal Rumble","ratings":{"Foffi":8.1,"Jan":7.77,"Björn":8.0}},
  {"type":"RAW","date":"2026-02-02","title":"","ratings":{"Foffi":8.4,"Jan":8.8,"Björn":8.0}},
  {"type":"SmackDown","date":"2026-02-06","title":"","ratings":{"Foffi":5.1,"Jan":5.0,"Björn":6.0}},
  {"type":"RAW","date":"2026-02-09","title":"","ratings":{"Foffi":6.2,"Jan":7.5,"Björn":7.0}},
  {"type":"SmackDown","date":"2026-02-13","title":"","ratings":{"Foffi":6.1,"Jan":6.0,"Björn":6.5}},
  {"type":"RAW","date":"2026-02-16","title":"","ratings":{"Foffi":7.7,"Jan":7.2,"Björn":7.9}},
  {"type":"SmackDown","date":"2026-02-20","title":"","ratings":{"Foffi":7.8,"Jan":7.5,"Björn":7.7}},
  {"type":"RAW","date":"2026-02-23","title":"","ratings":{"Foffi":5.3,"Jan":6.5,"Björn":6.0}},
  {"type":"SmackDown","date":"2026-02-27","title":"","ratings":{"Foffi":7.7,"Jan":7.0,"Björn":7.5}},
  {"type":"PLE","date":"2026-02-28","title":"Elimination Chamber","ratings":{"Foffi":8.9,"Jan":8.5,"Björn":9.0}},
  {"type":"RAW","date":"2026-03-02","title":"DANHAUSEN!","ratings":{"Foffi":13.0,"Jan":15.0,"Björn":15.0}},
  {"type":"SmackDown","date":"2026-03-06","title":"DANHAUSEN!","ratings":{"Foffi":8.2,"Jan":8.0,"Björn":7.7}},
  {"type":"RAW","date":"2026-03-09","title":"","ratings":{"Foffi":8.5,"Jan":9.0,"Björn":8.5}},
  {"type":"SmackDown","date":"2026-03-13","title":"","ratings":{"Foffi":9.2,"Jan":9.0,"Björn":9.0}},
  {"type":"RAW","date":"2026-03-16","title":"DANHAUSEN!","ratings":{"Foffi":10.0,"Jan":7.5,"Björn":7.1}},
  {"type":"SmackDown","date":"2026-03-20","title":"DANHAUSEN","ratings":{"Foffi":9.5,"Jan":9.0,"Björn":9.1}},
  {"type":"RAW","date":"2026-03-23","title":"YA BOI IS BOUNCY","ratings":{"Foffi":8.2,"Jan":7.0,"Björn":8.5}},
  {"type":"SmackDown","date":"2026-03-27","title":"","ratings":{"Foffi":7.6,"Jan":2.2,"Björn":7.9}},
  {"type":"RAW","date":"2026-03-30","title":"","ratings":{"Foffi":1.5,"Jan":6.5,"Björn":8.0}},
  {"type":"SmackDown","date":"2026-04-03","title":"","ratings":{"Foffi":7.6,"Jan":6.0,"Björn":7.77}},
  {"type":"RAW","date":"2026-04-06","title":"","ratings":{"Foffi":8.8,"Jan":8.5,"Björn":8.6}},
  {"type":"SmackDown","date":"2026-04-10","title":"DANHAUSEN!","ratings":{"Foffi":7.55,"Jan":7.5,"Björn":7.6}},
  {"type":"RAW","date":"2026-04-13","title":"","ratings":{"Jan":8.0,"Björn":8.0}},
  {"type":"SmackDown","date":"2026-04-17","title":"","ratings":{"Foffi":6.0,"Jan":5.0,"Björn":7.0}},
  {"type":"PLE","date":"2026-04-18","title":"WrestleMania Night 1","ratings":{"Foffi":8.0,"Jan":7.5,"Björn":7.99,"Curry":8.0}},
  {"type":"PLE","date":"2026-04-19","title":"WrestleMania Night 2","ratings":{"Foffi":8.8,"Jan":8.8,"Björn":9.0,"Curry":9.5}},
  {"type":"RAW","date":"2026-04-20","title":"","ratings":{"Foffi":8.23,"Jan":7.0,"Björn":8.95}},
  {"type":"SmackDown","date":"2026-04-24","title":"","ratings":{"Foffi":8.9,"Jan":8.5,"Björn":8.88}},
  {"type":"RAW","date":"2026-04-27","title":"Can we fire Logan Paul?","ratings":{"Foffi":8.2,"Jan":8.2,"Björn":8.33}},
  {"type":"SmackDown","date":"2026-05-01","title":"","ratings":{"Foffi":6.8,"Jan":7.2,"Björn":7.25}},
  {"type":"RAW","date":"2026-05-04","title":"","ratings":{"Foffi":7.6,"Jan":8.0,"Björn":8.2}},
  {"type":"SmackDown","date":"2026-05-08","title":"","ratings":{"Foffi":6.45,"Jan":7.0,"Björn":7.0}},
  {"type":"PLE","date":"2026-05-09","title":"Backlash","ratings":{"Foffi":6.2,"Jan":7.8,"Björn":7.5,"Curry":8.5}},
  {"type":"RAW","date":"2026-05-11","title":"","ratings":{"Foffi":8.7,"Jan":8.3,"Björn":8.3}},
  {"type":"SmackDown","date":"2026-05-15","title":"","ratings":{"Foffi":7.2,"Jan":7.7,"Björn":7.1}},
  {"type":"RAW","date":"2026-05-18","title":"","ratings":{"Foffi":8.3,"Jan":7.2,"Björn":8.0}},
  {"type":"SmackDown","date":"2026-05-22","title":"","ratings":{"Foffi":7.4,"Jan":6.8,"Björn":7.0}},
  {"type":"SNM","date":"2026-05-23","title":"","ratings":{"Foffi":6.6,"Jan":6.7}},
  {"type":"RAW","date":"2026-05-25","title":"","ratings":{"Foffi":9.1}},
]

async function seed() {
  console.log('Seeding persons...')
  await sql`INSERT INTO persons (name) VALUES ('Foffi'),('Jan'),('Björn'),('Curry') ON CONFLICT (name) DO NOTHING`

  console.log(`Seeding ${SHOWS.length} shows...`)
  for (const show of SHOWS) {
    const [{ id }] = await sql`
      INSERT INTO shows (type, date, title)
      VALUES (${show.type}, ${show.date}, ${show.title || ''})
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    if (!id) continue
    for (const [person, score] of Object.entries(show.ratings)) {
      await sql`
        INSERT INTO ratings (show_id, person_name, score)
        VALUES (${id}, ${person}, ${score})
        ON CONFLICT (show_id, person_name) DO NOTHING
      `
    }
  }
  console.log('Done ✅')
  await sql.end()
}

seed().catch(console.error)
