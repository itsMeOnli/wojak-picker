# Wojak Picker

Browse, search, and copy Wojaks straight into any chat from Raycast.

![Store Hero](./media/store-hero.png)

## Features

- Fast grid browsing with lazy loading
- Fuzzy search across thousands of Wojaks
- One-key copy to clipboard for chats and messages
- Supabase-backed image hosting so it works on any machine
- Local metadata and image caching for smoother repeat use

![Search Grid](./media/search-grid.png)

## Setup

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Open Raycast and run `Search Wojaks`.

### Build

```bash
npm run build
```

### Publish

```bash
npm run publish
```

## Supabase Setup

### 1. Create storage + table

Run the SQL in [001_create_wojaks.sql](./supabase/migrations/001_create_wojaks.sql) inside the Supabase SQL editor.

### 2. Add local migration secrets

Copy `.env.local.example` to `.env.local` and fill in:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`

### 3. Upload assets and insert metadata

```bash
npm run migrate:supabase
```

This uploads the local scraped image library to Supabase Storage and upserts rows into `public.wojaks`.

## Branding Assets To Add

Add these files yourself before store submission:

- `media/store-hero.png`
- `media/search-grid.png`
- `media/copy-action.png`

If you want a new extension icon, replace:

- `assets/icon.png`

## Development Notes

- The extension uses baked-in Supabase defaults for store users.
- Search metadata is cached for 24 hours in Raycast LocalStorage.
- Copied images are cached locally in Raycast support storage after first download.
