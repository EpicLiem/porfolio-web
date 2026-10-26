# Portfolio corrections verification

## Dependency update results

Updated existing major-version lines and their transitive dependencies, including Next.js 15.5.28, React/React DOM 19.3.1, DayPicker 9.14.0, PostCSS 8.5.31, Tailwind CSS 3.4.19, Radix components, and TypeScript 5.9.3. Migrated Zod to 4.6.7 and its form resolver to 6.0.0 to address the Zod advisory. Refreshed both package-manager lockfiles; the pnpm lockfile was imported from the tested npm lockfile so it also selects patched Sharp 0.35.5.

The PostCSS selector parser is overridden to ^7.1.7 for both package managers because Tailwind 3 and its typography plugin otherwise retain vulnerable 6.x versions. The production CSS build and mobile MDX rendering passed with this override.

Fixed the calendar wrapper's obsolete class names and icon slots using the [DayPicker migration guide](https://daypicker.dev/v9/upgrading). Verified the existing validation paths against [Zod 4's migration guidance](https://zod.dev/v4/changelog). Corrected the optional blog-image type and asynchronous route-parameter type. Type validation is now enabled during builds. These results supersede the earlier TypeScript failures below.

Resend is now initialized only inside the send operation, after the existing credential check. Its updated constructor rejects missing keys; eager initialization was causing unrelated guestbook actions to fail in local environments without email credentials.

Validation after the dependency update:

- `npm ci --cache /tmp/portfolio-npm-cache`: passed with the updated lockfile.
- `pnpm install --lockfile-only --frozen-lockfile --ignore-scripts`: passed.
- `npm audit --audit-level=low` and `pnpm audit --audit-level=low`: zero known vulnerabilities (initial npm audit: 10, including one critical and seven high).
- `npm run build`: passed, including type validation and all seven generated pages.
- `npx tsc --noEmit --incremental false`: passed.
- `git diff --check`: passed.
- `node /tmp/portfolio-browser-check/check.cjs`: all portfolio assertions passed at 1440px, 390px, and 320px; no page errors or horizontal overflow.
- `node /tmp/portfolio-browser-check/dependency-pages.cjs`: blog index and MDX navigation, contact invalid-email validation/cancel, and server-side Zod rejection of an oversized guestbook name passed. No valid submission was sent. Visually inspected the mobile MDX screenshot.
- `npx --yes --cache /tmp/portfolio-npm-cache tsx --tsconfig /Users/liem/.t3/worktrees/epicliem.com/portfolio-corrections-current/tsconfig.json /tmp/portfolio-browser-check/calendar-check.ts`: calendar server rendering passed for month, selected date, and custom previous/next icons.

This is a compatibility-focused update, not an upgrade of every package to its newest major. Next.js 16, Tailwind 4, Recharts 3, and other unrelated major migrations were deferred. The existing Recharts 2 and Vercel Postgres packages still emit deprecation notices; neither dependency tree has a reported audit vulnerability. ESLint remains unconfigured. No deployment, push, production credentials, or database migration was performed.

Requirements: the complete supplied `portfolio_website_corrections.docx`, dated October 25, 2026, including its embedded hyperlink destinations.

Implemented in `EpicLiem/porfolio-web` on branch `fix/portfolio-website-corrections`. The originally specified `epicliemv2` repository did not contain the deployed portfolio implementation. The user authorized locating and cloning the current source. This is a separate isolated clone at `/Users/liem/.t3/worktrees/epicliem.com/portfolio-corrections-current`; the original thread worktree and both existing clones were left unchanged.

## Changes

- Home and terminal share the supplied BU biography. Personal Info, Experience Education, and terminal education put Boston University first, with Engineering Undecided and expected graduation in 2030, followed by GFS graduation in 2026.
- GFS coursework is explicitly identified as high school coursework. No unconfirmed BU courses were added.
- Flowcast and NoteBrew lead Projects and the project timeline. The descriptions, dates, award, synthetic-student qualification, and four links match the document.
- Terminal projects and experience use the same data as the main sections. All eight projects and four roles are included; older entries remain.
- No current resume PDF exists in the repository. As instructed, `resume.pdf` was removed from `ls`; no unavailable download is advertised.
- Long terminal output wraps on narrow screens, and the terminal input has an accessible name.

## Checks

- `npm ci --cache /tmp/portfolio-npm-cache`: passed.
- `npm run build`: passed, seven static pages generated. Existing configuration skips lint and type validation, so those were attempted separately.
- `git diff --check`: passed.
- After the user's status confirmations, `npm run build` and the same three-width browser suite passed again. Additional assertions verify Honeycake's ongoing terminal period, the patent wording, Summer 2026 in both EMP entries, removal of current WIP wording, and removal of the Volunteer role label.
- `npx tsc --noEmit --incremental false`: failed with three existing errors: optional blog image versus required `PostData.image` in `app/blog/page.tsx:50`, and incompatible `caption` and `IconLeft` calendar API properties in `components/ui/calendar.tsx:25,57`. The untouched HEAD archive produced the identical errors using the same installed dependencies.
- `npm run lint`: opened Next.js's initial ESLint configuration prompt; this repository has no configured ESLint setup. No lint success is claimed and no lint configuration was added.
- `npm run start -- --port 3107` followed by `node /tmp/portfolio-browser-check/check.cjs`: passed at 1440x1000, 390x844, and 320x740 using local headless Chrome through Playwright. Checked Home copy, education order and graduation text, four roles, eight projects, timeline copy, all four supplied link destinations, link focus, about/education/experience/projects commands, all listed `cat` aliases, removal of the missing resume from `ls`, no horizontal overflow, and no browser page errors.
- Screenshots saved under `/tmp/portfolio-browser-check/`. Visually inspected desktop Projects, mobile Home and Projects, and narrow-mobile Experience/Education.
- T3 preview navigation worked, but snapshots failed twice with `Preview automation snapshot timed out after 15000ms.` Browser verification therefore used the local Playwright fallback.

## Scope and remaining inputs

The user confirmed Honeycake is ongoing, Micropantry's role is CIO, EMP was last summer (Summer 2026), and Good-Loop's patent application is still in progress. Honeycake now uses the shared February 2025 - Present period in the terminal as well as Experience. Micropantry uses CIO in Projects and the timeline. EMP uses Summer 2026 and past-tense design wording, without claiming completion. Micropantry's existing ongoing date remains unchanged because no end date was supplied.

No current resume was supplied. Add a verified current PDF and a shared download URL when available.

No production service credentials were copied. Local startup logs report missing `GROQ_API_KEY`; contact delivery, guestbook writes, and moderation were not exercised. No deployment, push, or external message submission was performed.

## Scoped UI review

- Content PASS: new factual copy and destinations come from the supplied document; no population-tracking or predictive-accuracy claims were added.
- Layout PASS: retained the existing amber monospace terminal design; project dates stack on mobile, and longer terminal output wraps. All tested widths have no horizontal page overflow.
- Interaction PASS: terminal commands and aliases return the updated content; new links have the supplied destinations and keyboard focus styling.
- Visual direction PASS: existing terminal motif, typography, spacing, and palette retained for continuity. No unrelated redesign or new decorative assets.

This review covers the requested corrections, not a site-wide accessibility or security audit.
