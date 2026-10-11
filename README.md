# StreamX Web

A Netflix-style front end (static HTML/CSS/JS, **no build step, no dependencies**) that browses
movies and series through the keyless [StreamX API](../api).

## Backend

The UI talks to a StreamX API deployment. Default base URL is set in `config.js`:

```js
export const API_BASE = "https://api.streamx.qzz.io";
export const API_FALLBACK = "https://streamx-api.pages.dev";
```

If the primary base is unreachable, the client automatically retries against the fallback.
Change `API_BASE` to point at any other StreamX API instance.

## Endpoints used

| Purpose        | Endpoint                                              |
| -------------- | ----------------------------------------------------- |
| Rows / catalog | `GET /catalog/:type/top?genre=&skip=`                 |
| Search         | `GET /search?q=&type=movie\|series`                   |
| Details        | `GET /meta/:type/:id` (movie or series, IMDb ids)     |
| Images         | `GET /img/{poster\|background\|logo}/{size}/:id/img`  |

## Features

- Hero banner with logo artwork, backdrop, rating, and rotating featured titles
- Horizontally scrolling rows (trending + genres) with skeleton loading states
- Live search across movies and series with debounced input
- Detail overlay: backdrop/logo, facts, cast, genres, and trailer lightbox (YouTube)
- Series view: season tabs and episode lists with thumbnails
- Hash routing (`#/movies`, `#/series`, `#/search/<q>`, `#/title/<type>/<id>`) — deep-linkable
- Fully responsive, keyboard-friendly (Esc closes overlays), reduced-motion aware

## Run locally

Any static file server works (ES modules require HTTP, not `file://`):

```bash
cd Web
python3 -m http.server 5500
# open http://localhost:5500
```

## Deploy

Static hosting — no build command, no environment variables. Publish this folder as the output root.

- **Cloudflare Pages:** Framework preset `None`, build command empty, output directory `Web` (or set
  this folder as the project root and output `.`).
- **Netlify / Vercel / GitHub Pages:** publish the `Web` folder directly.

## Files

```
Web/
├── index.html    # shell: nav, hero, rows, detail + lightbox containers
├── style.css     # design tokens + all component styles
├── config.js     # API base URLs
├── api.js        # tiny fetch client + image URL helpers
└── app.js        # routing, rows, hero, search, detail, episodes
```

Metadata is provided by [Cinemeta](https://github.com/Stremio/stremio-addons) and artwork by
[MetaHub](https://www.metahub.space) — both keyless, community-run services. For demonstration.
