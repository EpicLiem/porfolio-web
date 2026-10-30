# Guestbook administration

Open `/admin`. Configure `ADMIN_PASSWORD` with a long, unique password and `POSTGRES_URL` for the existing guestbook database. No credentials are bundled into the browser. Missing credentials or database configuration fail closed; the application does not create or alter tables at runtime.

The schema is unchanged from main: `guestbook_entries` has UUID `id`, `name`, `message`, `created_at`, and optional `ip`; `blacklisted_ips` has unique `ip` and `created_at`. Posting uses this same blocklist. Blocking an IP does not remove existing entries.

Successful login sets a signed, eight-hour HTTP-only cookie, scoped to `/admin`, with SameSite Strict and Secure in production. Every dashboard read and mutation checks the session on the server. Rotating `ADMIN_PASSWORD` invalidates existing sessions. Signing out clears the current browser's cookie. The password is never retained in hidden form fields or browser storage.

The page lists 50 entries and 50 blocked addresses per page, with separate pagination controls. Deletion requires confirmation. Writes use parameterized SQL and validate IDs and IP addresses. Errors remain errors rather than displaying an empty success list.

Login attempts are limited to ten per trusted IP per fifteen minutes within one server process. This is not a shared, cross-instance limit. Forwarded IP headers are trusted only on Vercel or with the existing `FORMS_TRUST_PROXY` setting; unknown clients share one bucket.

Run `npm run test:admin` for authorization, session tampering/expiry, pagination, validation, error handling, and parameterized-query tests. Tests use isolated fixtures rather than production guestbook records. `npm run test:forms` covers the public posting/blocklist behavior.
