# ReviewBoost

Professionelle Review-Management-Plattform gebaut mit Next.js 16, Supabase Auth & Supabase DB.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Auth + DB:** Supabase
- **Styling:** 100% Inline Styles (kein CSS Framework)
- **Deployment:** Vercel-ready

## Setup in 5 Minuten

### 1. Supabase Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com) → Neues Projekt anlegen
2. Unter **SQL Editor** → das komplette `supabase-schema.sql` ausführen
3. Unter **Authentication → Email** → E-Mail-Bestätigung optional deaktivieren für lokale Entwicklung

### 2. Environment Variables setzen
Trage deine Supabase-Werte in `.env.local` ein:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Beide Werte findest du in Supabase unter **Project Settings → API**.

### 3. Lokal starten
```bash
npm install
npm run dev
```

### 4. Deploy auf Vercel
1. Repository auf GitHub pushen
2. Auf [vercel.com](https://vercel.com) → "Import Project" → Repo wählen
3. Environment Variables eintragen
4. Deploy — fertig!

## Seiten

| Route | Beschreibung |
|-------|-------------|
| `/` | Landing Page |
| `/signup` | Registrierung |
| `/login` | Anmeldung |
| `/dashboard` | Geschütztes Review-Dashboard |
| `/auth/callback` | Supabase Auth-Callback |

## Datenbankschema

Tabelle `reviews` — siehe `supabase-schema.sql`
