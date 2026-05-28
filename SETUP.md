# Setup — wwe-rater

## 1. Dependencies installieren
```bash
npm install
```

## 2. Env-Datei anlegen
```bash
cp .env.example .env.local
```
Dann `.env.local` öffnen und ausfüllen:
- `DATABASE_URL` → Transaction Pooler URL aus Supabase Dashboard
  (Project Settings → Database → Connection string → Transaction mode, Port 6543)
- `APP_PIN` → z.B. `1312` (was auch immer ihr wollt)

## 3. Datenbank einrichten
Im Supabase Dashboard → SQL Editor:
```sql
-- Inhalt von db/schema.sql einfügen und ausführen
```

## 4. Alte Daten importieren
```bash
node db/seed.js
```
Importiert alle 48 Shows aus der alten Excel-Tabelle.

## 5. Lokal testen
```bash
npm run dev
```
→ http://localhost:3000 → PIN eingeben → fertig

## 6. Auf Vercel deployen
```bash
# Entweder per Vercel CLI:
npx vercel

# Oder: GitHub Repo pushen → Vercel Dashboard → Import
```

In Vercel unter Settings → Environment Variables:
- `DATABASE_URL` (Production)
- `APP_PIN` (Production)

---

## Fertig 🏆
Die App läuft, alle können sich mit dem PIN einloggen.
