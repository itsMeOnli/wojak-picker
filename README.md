# Wojak Picker — Raycast Extension

Search and copy wojak images to your clipboard directly from Raycast.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Optional: scrape locally

This fetches all wojaks from wojakland.com and builds `assets/wojaks.json`.

```bash
node scrape/scrape.js
```

Takes ~2-3 minutes (polite 300ms delay between requests). Run this once,
then re-run whenever you want fresh wojaks before uploading to Supabase.

### 3. Configure Supabase in Raycast

Open the extension preferences in Raycast and fill in:

- `Supabase URL`
- `Supabase Anon Key`
- `Supabase Bucket` (defaults to `wojaks`)

### 4. Develop

```bash
npm run dev
```

Open Raycast and search for "Search Wojaks".

### 5. Build

```bash
npm run build
```

## Supabase Migration

### 1. Create the table + bucket

Run the SQL in:

```bash
supabase/migrations/001_create_wojaks.sql
```

in the Supabase SQL editor.

### 2. Add local migration secrets

Copy `.env.local.example` to `.env.local` and fill in:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`

### 3. Upload images + insert rows

```bash
npm run migrate:supabase
```

This uploads your local `assets/wojaks/` library into Supabase Storage and upserts metadata rows into `public.wojaks`.

---

## How It Works

```
Supabase table + storage    ← source of truth
        ↓
Raycast fetches metadata on launch
        ↓
LocalStorage caches metadata for 24h
        ↓
User selects a wojak
        ↓
Downloads image from Supabase Storage if not already cached
        ↓
Copies to clipboard as image file
```
