# Search and social metadata

`lib/site.ts` holds the canonical origin, title, and description. The origin remains `https://www.epicliem.com`, matching main. The homepage declares its canonical URL and WebSite/Person structured data using existing profile links. No ratings, audience counts, or other unsupported claims are included.

The root layout supplies Open Graph and Twitter large-image card metadata. `app/opengraph-image.tsx` produces a 1200×630 PNG using the desktop's local Terminess font and brown/cream palette. The image is generated during the build and served at `/opengraph-image`; it requires no external image service or font request.

`/robots.txt` allows the public site and disallows `/admin`. `/sitemap.xml` lists only the canonical homepage, not redirects or private admin pages. The admin page always sends noindex/nofollow metadata. Builds with `VERCEL_ENV=preview` disable homepage indexing, disallow crawling and produce an empty sitemap. Production homepage metadata permits indexing. Actual indexing and social-platform cache refreshes are controlled by those services.

NoteBrew's plain-text policy was restored from `origin/main` at `2cb7c58`, retaining its May 10, 2025 date and policy statements. The only text correction is the incomplete contact email, now `liem@epicliem.com`. Its existing URL is `/notebrew/privacy-policy.txt`, also linked from the NoteBrew project.

Validation for this change: lint, typecheck and production build passed; 7 admin and 6 public-form tests passed. Production HTTP/browser checks covered canonical/indexing tags, OG/Twitter metadata, JSON-LD, the rendered PNG and dimensions, robots/sitemap, policy delivery, login rejection/success, logout, tampered-session rejection and cookie flags. Separate fixture-backed browser checks exercised admin pagination, deletion confirmation, IP block/unblock, validation, escaped messages and mobile layout. No production database was accessed; a configured `ADMIN_PASSWORD` and `POSTGRES_URL` are still required for real administration.
