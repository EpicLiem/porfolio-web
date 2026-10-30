# Redesign compared with main

Compared the complete `redesign/v2` working tree, including untracked implementation files, with freshly fetched `origin/main` at `2cb7c58`. Local `main` is one commit behind that reference. This is a source comparison, not production or account verification.

## Functionality and content comparison

| Area | Present on main | Current redesign |
| --- | --- | --- |
| Blog | `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `content/blog/first-post.mdx` | No blog routes or posts. Existing `/blog` and `/blog/first-post` URLs are absent. |
| NoteBrew privacy policy | `public/notebrew/privacy-policy.txt` | Restored at `/notebrew/privacy-policy.txt`; linked from NoteBrew. The truncated contact email was corrected. |
| Guestbook administration | `app/admin/page.tsx` and management actions in `app/actions.ts` | Restored at `/admin`, with authenticated entry deletion and IP blocking/unblocking. See `docs/admin.md`. |
| Historical projects | `lib/projects.ts`: Epicliem.com, Wake On Lan Server, ChessAI (June 2023), Miller-Rabin Primality Test | These four entries are absent from `lib/portfolio.ts`. Liemfish is distinct from the historical ChessAI project. |
| Skills and interests | `components/skills-matrix.tsx`: languages, tools, cloud, databases/networking, interests and volunteering | No corresponding section. |
| Earlier education | `lib/portfolio.ts`: Germantown Friends School, graduated 2026; CS 1–3, CS Capstone and Differential Calculus | BU education remains; earlier education/coursework is absent. |
| Search and social metadata | `metadataBase`, OpenGraph metadata, social screenshot and `public/robots.txt` | Restored canonical, Open Graph/Twitter and structured metadata, a new 1200×630 social image, robots and sitemap routes. Production homepage indexing is enabled; admin and preview deployments remain excluded. |

## Replaced or deliberately reduced presentation

- Contact and guestbook have replacement implementations, including validation, moderation and rate limiting. They are not missing. Actual email delivery and database access still depend on deployment configuration and were not exercised for this comparison.
- Projects and experience use desktop windows instead of the old timelines. All four employers from main remain, and Micropantry is also listed as experience.
- Experience descriptions omit some old details: manager names, technology tags, B Corp/nonprofit labels and the exact Honeycake speedup claim.
- The old performance card and direct terminal `skills`/`education` commands are absent. The terminal has a different command/filesystem model.
- Chess, effects, the launcher and window management are additions.

## Changes made with this comparison

- `/` renders the desktop and Arch startup directly.
- `/desktop` permanently redirects to `/` to preserve old links.
- Removed the café route, its public assets, its exclusive dialog styles/component and unused café fonts. Historical verification records remain historical.
- Blog, older projects, skills/interests, and earlier education remain absent. Privacy policy, guestbook administration, and SEO/social metadata were restored in the follow-up change.
