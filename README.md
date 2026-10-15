# StreamX — Web

A monochrome, motion-rich front end for the **StreamX** metadata API. It surfaces
everything a poster wall usually hides: aggregate scores, full cast and crew,
production facts, episode guides, trailers, similar titles, Wikipedia summaries
and where-to-watch availability — with **no accounts, no tracking and no API
keys in the browser**.

Built with **Vite + React 19 + TypeScript**, styled with **Tailwind CSS v4**, and
animated with **Motion**, **GSAP**, **Lenis** and **anime.js**. The page
background is a live **WebGL** shader plane (three.js).

## Stack

| Concern      | Choice                                                              |
| ------------ | ------------------------------------------------------------------- |
| Build        | Vite 8 (rolldown) + `@vitejs/plugin-react`                          |
| UI           | React 19, React Router 7 (`HashRouter`)                             |
| Styling      | Tailwind CSS v4 (`@tailwindcss/vite`), strict monochrome dark theme |
| Motion       | `motion` (Framer Motion), `gsap` + ScrollTrigger, `lenis`, `animejs` |
| 3D           | `three` (vendored as a prebuilt static asset — see below)           |
| Fonts        | Space Grotesk, Manrope, JetBrains Mono (`@fontsource-variable`)     |
| Icons        | Solar Icon Set — **Bold** and **Bold Duotone** only                 |

## Scripts

```bash
npm install
npm run dev         # Vite dev server
npm run build       # production build → dist/
npm run preview     # preview the production build on :4173
npm run typecheck   # tsc --noEmit
npm run vendor:three  # regenerate public/vendor/three/three.module.js
```

### Why three.js is not bundled

The app build keeps `three` **external** and imports it from
`/vendor/three/three.module.js`, a prebuilt, minified ESM file generated once by
`npm run vendor:three`. This keeps the app chunk small and avoids the bundler
parsing ~1.4 MB of library code on every build. `index.html` also carries an
import map for `three` as a fallback resolution path.

## Routes

`HashRouter` so the site can be hosted on any static host with deep links:

| Route                      | Page                                            |
| -------------------------- | ----------------------------------------------- |
| `#/`                       | Home — hero, capability band, rows, why-StreamX |
| `#/movies`                 | Movies catalogue (genre filter, load more)      |
| `#/series`                 | Series catalogue                                |
| `#/search`                 | Search (movies + series + IMDb suggestions)     |
| `#/search/:q`              | Search results for a query                      |
| `#/title/:type/:id`        | Title detail (scores, cast, facts, episodes, …) |
| anything else              | Not found                                       |

## Data

All data comes from the keyless StreamX API (`https://api.streamx.qzz.io`, with
`https://streamx-api.pages.dev` as a fallback). See `src/lib/api.ts` for the
endpoint bindings and `src/lib/types.ts` for the response shapes. The watchlist
is stored locally in `localStorage` and never leaves the device.

## Theme

Dark only, by definition. Surfaces are black shades (`#050505`–`#232323`);
`#757575` is the specified secondary palette token, with `#a6a6a6`
(`--color-body`) used for long-form reading text so contrast clears WCAG AA.

## Attribution

See [`NOTICE`](./NOTICE). Icons are CC BY 4.0 (Solar Icon Set by 480 Design);
fonts are SIL OFL 1.1; three.js is MIT. Posters and artwork remain © their
respective rights holders.
