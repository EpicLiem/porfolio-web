# Application launcher

The launcher follows the Rofi configuration shipped in [Rumda](https://github.com/hexonide/rumda/blob/41e94b7133f46db7ea02e4eca360e2bb0a999539/dark-config/rofi/config.rasi), linked from the author's [r/unixporn post](https://www.reddit.com/r/unixporn/comments/1ooghjx/hyprland_rumda/). Inspected the actual config and fonts.rasi in the local reference clone, not only screenshots.

Also inspected [adi1090x's Type 1 Rofi source](https://github.com/adi1090x/rofi/blob/master/files/launchers/type-1/style-1.rasi), the upstream author credited in Rumda's config, showcased on [r/unixporn](https://www.reddit.com/r/unixporn/comments/zzfdcy/). Its larger two-column layout was not used: Rumda's narrower single-column version fits this desktop.

Retained from Rumda: centered placement, 2px border, nearly square corners, Dogica Pixel, search above a single list, 5px row spacing, inverted selection, wrapping arrow navigation, and no app icons inside results. Adaptations: 380px width for readable browser text, six portfolio applications, an Escape button, a compact keyboard hint, and the existing coffee palette. Sidebar icons remain available.

Ctrl+Space opens or closes the launcher. Search matches names and related terms (for example, “email” finds Contact). Up/Down selects with wrapping; Enter opens or restores the app; Escape or the backdrop dismisses. A dot marks an already-open application. Launching focuses the resulting tile; dismissal restores previous focus. Native modal semantics isolate the desktop while the launcher is open, and the boot overlay disables its shortcut.

Guestbook and Contact start closed and are available from the sidebar and launcher. Contact retains the direct email and social links alongside the form. Forms use the existing service integrations; see forms.md for configuration and verification.

## Integrated verification

- `npm run lint`: passed, no warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed; `/desktop` and `/cafe` generated successfully.
- `npm run test:forms`: 6/6 mocked backend tests passed.
- `node /tmp/check-launcher-forms.cjs`: passed search, empty matches, wraparound selection, Enter/focus transfer, Ctrl+Space, Escape/focus restoration, six applications, and opening both forms. No page errors. Captured and visually inspected `/tmp/portfolio-launcher.png`, `/tmp/portfolio-contact-form.png`, and `/tmp/portfolio-guestbook.png` at 1600×1000.
- `node /tmp/check-form-errors.cjs`: passed real local server-action responses for missing configuration, retention of both forms' drafts after failures, re-enabled submit buttons, and minimize/restore state preservation at 1440×900.
- `git diff --check`: passed.

T3 preview snapshots timed out twice; browser checks used isolated headless Chrome through Playwright. No emails or database writes occurred. Live delivery/posting requires the server credentials documented in forms.md.
