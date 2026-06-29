# Wojak Picker

Browse, search, and copy Wojaks straight into any chat from Raycast.

![Store Hero](./media/store-hero.png)

## Features

- Fast grid browsing with lazy loading
- Fuzzy search across thousands of Wojaks
- One-key copy to clipboard for chats and messages
- Self-hosted static image hosting (any VPS + Nginx) so it works on any machine
- Local metadata and image caching for smoother repeat use

![Search Grid](./media/search-grid.png)

## Usage

Open Raycast and run `Search Wojaks`.

- Browse the grid to discover Wojaks quickly
- Search by name, filename, or category
- Press `Enter` to copy the selected image to your clipboard
- Use `Cmd+O` to open the source image in the browser
- Use `Cmd+Shift+C` to copy the source image URL

## Self-hosting the image library

The extension is a thin client over a folder of static files served by your own web
server. See [`deploy/README.md`](./deploy/README.md) for the full setup, but the short
version:

1. `WOJAK_BASE_URL=https://wojaks.example.com npm run build:deploy` — generates 320px
   thumbnails and a `wojaks.json` manifest into `deploy/dist/`.
2. `VPS_HOST=user@your-vps npm run deploy` — rsyncs `deploy/dist/` to `/var/www/wojaks`.
3. Point Nginx at that folder using [`deploy/nginx-wojaks.conf`](./deploy/nginx-wojaks.conf).
4. Set `Library Base URL` in the extension preferences to your domain.

## Development Notes

- Configure `Library Base URL` in the extension preferences before first use.
- The extension fetches `<baseUrl>/wojaks.json` and loads images from `<baseUrl>/thumbs`
  and `<baseUrl>/images`.
- Search metadata is cached for 24 hours in Raycast LocalStorage.
- Copied images are cached locally in Raycast support storage after first download.
- Project maintenance scripts like scraping are for repository maintenance only.
