# Portfolio forms

`app/desktop/portfolio-forms.tsx` exports `ContactForm()` and `GuestbookWindow({ isOpen?: boolean })`. Both render window **content**, not desktop window chrome, and import their own plain CSS. Render beneath the desktop theme provider for `--ink`, `--muted`, `--link`, `--accent`, `--canvas`, `--inset`, `--selection`, `--frame`, and `--font-desktop`.

```tsx
import { ContactForm, GuestbookWindow } from "./portfolio-forms";
// In the existing window bodies:
<ContactForm />
<GuestbookWindow isOpen={guestbookOpen} />
```

Default `isOpen` is true. Mounting fetches the latest 50 entries. Pass the actual open state if the parent keeps closed windows mounted; false unmounts guestbook content and discards its draft. Changing false to true fetches again. A successful post refreshes entries, and Refresh entries retries loads. No entries are fabricated or optimistically inserted. Read failures and unconfigured databases are distinct from a successful empty list. Failed submissions retain controlled input values; successful submissions clear them. Fields have associated labels and validation messages, native required/length/email constraints, pending controls, and live status text. Guestbook text renders as escaped React text.

## Server configuration

Runtime dependencies added: `@vercel/postgres`, `groq-sdk`, `resend`, and `zod`. `tsx` is a development-only runner for the scoped Node tests. `@vercel/postgres` is retained for compatibility with the existing implementation; npm marks it deprecated.

- Contact: `RESEND_API_KEY`; optional `CONTACT_FROM_EMAIL` (default `Portfolio Contact <onboarding@resend.dev>`) and `CONTACT_TO_EMAIL` (default `liem@epicliem.com`). Resend's default sender is restricted; use a verified sender for deployment. Messages use plain text and a validated reply-to address.
- Guestbook reads: `POSTGRES_URL`, using the existing Vercel Postgres connection format.
- Guestbook writes: also `GROQ_API_KEY`; optional `GROQ_MODERATION_MODEL` defaults to the previous `meta-llama/llama-4-scout-17b-16e-instruct`. Missing, failed, or malformed moderation responses prevent publication. Model availability has not been verified against a live account.
- IP identity: on Vercel (`VERCEL=1`), use `x-vercel-forwarded-for`. Otherwise set `FORMS_TRUST_PROXY=true` only if your trusted ingress overwrites `x-forwarded-for`. Missing or invalid IPs disable signing. Do not enable this on a directly exposed origin accepting caller-supplied forwarding headers.

All variables stay server-side. No `.env*` files were present in the target or prior implementation worktree at initial inspection; RESEND_API_KEY, POSTGRES_URL, and GROQ_API_KEY were also absent from the agent process. No credentials were copied.

## Database compatibility and protections

The existing database must already contain:

- `guestbook_entries`: `id` with its existing default, `name`, `message`, `created_at` with its existing timestamp default, and `ip` (the prior implementation used `VARCHAR(45)`).
- `blacklisted_ips`: `ip`.

No schema is created or altered at runtime. Missing tables or columns produce an error state. Provision any missing schema separately through the owner's migration process. Reads select only public fields; no IP addresses are returned. Writes use parameterized SQL. A transaction-level per-IP advisory lock serializes blacklist/rate checks and insertion, enforcing one successful entry per minute across app instances. Blocked connections cannot write. This retains existing schema semantics and introduces no admin actions. A 10-second statement timeout bounds lock/query waits. Groq calls have a 15-second timeout and no automatic retry.

Names are trimmed, required, single-line, and at most 100 characters. Contact email is validated and capped at 254 characters; contact messages at 10,000 characters; guestbook messages at 500. Empty/whitespace-only messages and non-string fields fail validation. Contact is a public form, as before; deployment-level abuse protection/rate limiting remains an ingress responsibility. Groq moderation reduces abuse but is not a guarantee against adversarial content. Public posting sends the supplied name/message to Groq and stores the entry/IP in Postgres; contact messages go through Resend.

## Verification

Run `npm run test:forms`, `npx eslint app/actions.ts app/desktop/portfolio-forms.tsx lib/forms-service.ts lib/forms-database.ts lib/moderation.ts lib/forms.test.ts`, and `npx tsc --noEmit --incremental false`.

Tests inject mocked mail, moderation, and database transports. They cover validation, trimmed payloads, unavailable services, safe errors, moderation rejection, missing IPs, transaction ordering, blacklist/rate-limit outcomes, rollback/release, and SQL parameters. No real mail is sent and no production database is queried or written. Build/server startup and integrated browser/accessibility checks belong to parent integration and were not run in this task.
