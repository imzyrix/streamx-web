# StreamX Web

A Netflix-style front end (static HTML/CSS/JS, **no build step, no dependencies**) that browses
movies and series through the keyless [StreamX API](../api). The codebase is organised into small
ES modules under `js/` and wires the API deeply: ratings from three sources, cast & crew, where to
watch, similar titles, facts/Wikidata, Wikipedia summaries and series episodes.

## Backend

The UI talks to a StreamX API deployment. The base URLs live in `js/config.js`:

```js
export const API_BASE = "https://api.streamx.qzz.io";
export const API_FALLBACK = "https://streamx-api.pages.dev";
export const DEFAULT_COUNTRY = "US";
```

If the primary base is unreachable, the client retries against the fallback and remembers the new
base for the session. Change `API_BASE` to point at any other StreamX API instance.

## Endpoints wired

| Purpose             | Endpoint                                              |
| ------------------- | ----------------------------------------------------- |
| Rows / catalogue    | `GET /catalog/:type/:catalog?genre=&skip=`            |
| Search              | `GET /search?q=&type=movie\|series`                   |
| IMDb suggestions    | `GET /imdb/search?q=`                                 |
| Anime               | `GET /anime/search?q=` (AniList)                      |
| Details             | `GET /meta/:type/:id`                                 |
| Ratings             | `GET /scores/:type/:id` (IMDb · RT · Metacritic)      |
| Cast & crew         | `GET /credits/:type/:id` (Wikidata)                   |
| Similar titles      | `GET /similar/:type/:id`                              |
| Where to watch      | `GET /streaming/:type/:id?country=` (JustWatch)       |
| TV (series)         | `GET /tv/:id` (TVmaze)                                |
| Person bio          | `GET /person/:id`                                     |
| Artwork             | `GET /images/:type/:id` + `/img/...`                  |
| Health              | `GET /health`                                         |

Every request is memoised for the session (identical calls resolve once) and every detail extra
loads independently and **fails soft** — a slow or missing upstream just hides that section.

## Features

- Hero banner with logo artwork, backdrop, rating, and rotating featured titles
- Horizontally scrolling rows (trending + genres) with skeleton loading states
- Live search across movies and series (debounced) plus **IMDb** and **AniList** results
- Detail overlay:
  - score dials — IMDb, Rotten Tomatoes (Tomatometer + Popcornmeter), Metacritic
  - **Where to watch** with a region selector (JustWatch offers)
  - **Cast** and **crew** (directors) rows → click a person for their bio modal
  - **More like this** row
  - Facts from Wikidata (budget, box office, certification, languages, companies…) + external links
  - Wikipedia summary, genres, and trailer lightbox (YouTube)
- Series view: season tabs and episode lists with stills/thumbnails
- Hash routing (`#/movies`, `#/series`, `#/search/<q>`, `#/title/<type>/<id>`) — deep-linkable
- Fully responsive, keyboard-friendly (Esc closes overlays), reduced-motion aware

## Project layout

```
Web/
├── index.html              # shell: nav, tab bar, hero, rows, detail + lightbox containers
├── style.css               # design tokens + component styles (incl. mobile app mode)
├── manifest.webmanifest    # PWA manifest (name, icons, standalone display)
├── NOTICE                  # third-party attribution (Solar Icon Set, CC BY 4.0)
├── icons/                  # app icons (192/512, maskable, apple-touch) + SVG sources
└── js/
    ├── config.js           # API base URLs, home rows, timing
    ├── api.js              # fetch client, session cache, fallback, image URL helpers
    ├── util.js             # DOM + formatting helpers
    ├── icons.js            # Solar Icon Set (CC BY 4.0), inlined as currentColor SVGs
    ├── nav.js              # active navigation state
    ├── cards.js            # poster card markup + skeletons
    ├── hero.js             # rotating hero banner
    ├── home.js             # browse view (hero + rows)
    ├── search.js           # search view (title + IMDb + anime)
    ├── detail.js           # full detail view (scores, credits, similar, streaming, episodes)
    ├── person.js           # cast/crew bio modal
    ├── lightbox.js         # trailer lightbox
    ├── router.js           # hash router
    └── main.js             # entry point: global events + routing
```

## Mobile app mode

On phones (`≤900px`) the UI switches to a native-app layout:

- Bottom **tab bar** (Home · Movies · Series · Search) with active-state highlighting
- Full-screen **search screen** with its own input and live results
- Detail opens as a full screen with a **back button** (top-left)
- **Safe-area** padding for notched devices (`env(safe-area-inset-*)`)
- Card titles shown without hover on touch devices

It is also an installable **PWA**: `manifest.webmanifest` + icons let it be added to the home
screen and launch standalone (`display: standalone`, portrait, dark theme).

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

Metadata is provided by [Cinemeta](https://github.com/Stremio/stremio-addons) and artwork by
[MetaHub](https://www.metahub.space); ratings via Rotten Tomatoes & Metacritic; streaming offers via
JustWatch; people via Wikidata/Wikipedia; TV via TVmaze; anime via AniList — all keyless.

Icons: [Solar Icon Set](https://github.com/480-Design/Solar-Icon-Set) by 480 Design, licensed
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — see [NOTICE](./NOTICE).
