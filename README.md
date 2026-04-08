# Wojak Picker — Raycast Extension

Search and copy wojak images to your clipboard directly from Raycast.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run the scraper

This fetches all wojaks from wojakland.com and builds `assets/wojaks.json`.

```bash
node scrape/scrape.js
```

Takes ~2-3 minutes (polite 300ms delay between requests). Run this once,
then re-run whenever you want fresh wojaks.

### 3. Develop

```bash
npm run dev
```

Open Raycast and search for "Search Wojaks".

### 4. Build

```bash
npm run build
```

---

## How It Works

```
assets/wojaks.json          ← bundled index (names, URLs, categories)
        ↓
Raycast loads JSON into memory
        ↓
Fuse.js fuzzy search (instant, no network)
        ↓
User selects a wojak
        ↓
Fetches full PNG from wojakland.com
        ↓
Copies to clipboard as image file
```

## Keyboard Shortcuts

| Action                  | Shortcut      |
| ----------------------- | ------------- |
| Copy image to clipboard | `Enter`       |
| Open in browser         | `Cmd+O`       |
| Copy image URL          | `Cmd+Shift+C` |

## Future Improvements (Phase 2+)

- [ ] Local image cache (`environment.supportPath`) for instant repeat copies
- [ ] Lazy loading thumbnails
- [ ] Supabase backend so new wojaks appear without re-bundling
- [ ] Pinecone semantic search ("find me a sad programmer wojak")
