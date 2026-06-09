---
name: project-db-schema
description: Aktuelles DB-Schema inkl. shows.comment und ratings.note; Show-Typen ohne NXT
metadata:
  type: project
---

Aktueller Stand (inkl. nachträglicher Migrationen):

```sql
persons (id SERIAL PK, name VARCHAR(100) UNIQUE, created_at TIMESTAMPTZ)
shows   (id SERIAL PK, type VARCHAR(20) CHECK IN ('RAW','SmackDown','PLE','SNM','NXT'),
         date DATE, title VARCHAR(200) DEFAULT '', comment VARCHAR(300) DEFAULT '',
         created_at TIMESTAMPTZ)
ratings (id SERIAL PK, show_id FK → shows.id ON DELETE CASCADE,
         person_name VARCHAR(100), score DECIMAL(4,2), note TEXT,
         created_at TIMESTAMPTZ, UNIQUE(show_id, person_name))
```

- `shows.comment` — interner Spitzname pro Folge ("Die Stuhl-Match-Folge"), WWE-020
- `ratings.note` — DANHAUSEN-Begründung; vorhandene Note = Eintrag gilt als DANHAUSEN-Moment (UI färbt lila)
- CHECK erlaubt historisch noch 'NXT', aber **NXT wird nicht mehr genutzt** (WWE-012) — keine NXT-Rows anlegen
- `UNIQUE(show_id, person_name)` → bei Einzel-Upserts `ON CONFLICT (show_id, person_name) DO UPDATE`

**Why:** `comment` und `note` kamen per Migration dazu und fehlen in alten
Schema-Snippets. Wer sie übersieht, verliert Daten beim PATCH.

**How to apply:** Beim Schreiben von Ratings immer `note` mitführen; beim Schreiben
von Shows `comment`. Siehe [[project-db-stack]], [[project-api-contracts]].
