# Portfolio v2

A portfolio desktop built with Next.js 16.4.3 and React:

- `/`: a Rumda-based desktop with independent movable/resizable windows for experience, projects, biography, and contact. Includes minimize, maximize, close, restore, an application launcher, and the Arch-style startup.
- `/desktop`: redirects permanently to `/` for existing links.

The root renders the desktop directly. Project and career facts live in `lib/portfolio.ts`; desktop views are in `app/desktop/desktop-content.tsx`. The desktop follows Rumda's actual shell and window references, without a website top bar or footer.

## Development

Use Node.js 22.13 or newer and npm.

`npm run dev` and `npm run build` regenerate the desktop font subsets automatically, including in CI. The build scans `app/` and `lib/` for Nerd Font icons while retaining the original fonts' normal text characters for guestbook entries and terminal input. Source TTFs stay in the repository; generated WOFF2 files are ignored. `npm run verify:fonts` checks coverage, unchanged glyph geometry, freshness, and a 100 KiB budget per font. See [font generation](app/fonts/README.md).

```sh
npm ci
npm run prepare:chess -- --source /path/to/liemfish
npm run dev
```

## Verification

```sh
npm run lint
npm run test:fonts
npm run typecheck
npm run build
```

Run the production build locally with `npm run start`.

The chess GUI lives here. Browser inference, model encoding, timing, trained time controls, and engine tests live in [Liemfish](https://github.com/EpicLiem/liemfish), consumed through its versioned npm browser package. See [the integration guide](docs/chess-model.md) for the ownership boundary and asset setup. The Liemfish checkout must include its Git LFS model files when preparing assets; running the website does not need that checkout. Generated model/runtime files stay in ignored `public/chess/engine/`; chess-piece artwork remains in `public/chess/pieces/`. Development and production builds verify the generated assets before starting.

The homepage has canonical, Open Graph, Twitter card, and structured-data metadata, with a generated social preview at `/opengraph-image`. `/robots.txt` and `/sitemap.xml` describe the public homepage. Vercel preview deployments remain `noindex`; `/admin` is always `noindex` and excluded from the sitemap.

NoteBrew's existing privacy-policy URL is available at `/notebrew/privacy-policy.txt`.

Guestbook administration lives at `/admin`. Configure server-only `ADMIN_PASSWORD` and `POSTGRES_URL`; never prefix these with `NEXT_PUBLIC_`. The page supports paginated entry/IP lists, entry deletion, and IP blocking/unblocking. See [administration setup and verification](docs/admin.md).

Design and asset notes: [desktop](docs/desktop-design.md).

## Previous version

The previous version, including the reviewed bug fixes, is preserved at commit `cd95a6e` on `fix/portfolio-website-corrections`. This worktree uses `redesign/v2`; creating it did not change or deploy `main`.
