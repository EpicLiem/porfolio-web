# Integrated verification

## Coffee screenshot studies

- `npm run lint && npm run typecheck && npm run build`: exit 0.
- `node /tmp/coffee-studies-capture.cjs`: PASS; eight desktop and eight wallpaper screenshots at 1600×1000, all wallpapers decoded, four tiled windows, no Appearance controls, fixed default after reload, launcher and global keyboard navigation, zero runtime errors.
- `html_preview` at 1000px and 728px: gallery rendered; final preview has no missing images or console messages. Parent inspected dark/light desktop captures and the complete eight-study thumbnail gallery.
- `git diff --check`: exit 0.
- Antislop PASS: source-derived palettes with documented reasons and contrast checks, coffee motifs requested by user, actual browser screenshots, working desktop controls, no invented portfolio facts. Existing ENERGY 2 / RHYTHM 3 / MOTION 1 retained.

T3 screenshot attempts failed twice with `Preview automation snapshot timed out after 15000ms.` Captures used isolated installed Chrome. Colors in the alternate screenshots are injected into the capture page only; the site has no customization UI or persisted theme settings. Nothing pushed or deployed.

## Current: tiled desktop

- `npm run lint && npm run typecheck && npm run build`: exit 0; all routes prerendered.
- `npx tsc app/desktop/window-state.ts app/desktop/window-state.test.ts --outDir /tmp/portfolio-tiling-tests --module commonjs --target es2020 --esModuleInterop --skipLibCheck && node --test /tmp/portfolio-tiling-tests/window-state.test.js`: 8 passed, 0 failed.
- `git diff --check`: exit 0.
- `PORT=3109 node /tmp/desktop-tiling-qa.cjs`: passed. Four default apps including Keybindings; automatic tiling on open/close/minimize/restore; maximize; real pointer drag swaps and keyboard swaps/focus; selection preservation; Show Desktop; launcher/Escape; centered SVG icons; boot and blackout conceal sidebar; zero runtime errors. Layout checks at 1920×1080, 1440×900, 1024×650, 844×390, 390×844 and 320×740 found no overlaps, horizontal overflow or clipped sidebar controls.
- `npm run start -- --port 3109`: ready in 123ms.

Parent inspected screenshots of desktop, narrow fallback and boot. Collaborative preview verified interactions and boot stacking; its resize command returned a viewport that did not match the requested or actual dimensions, including after retry. Responsive checks therefore used isolated Chrome. The user subsequently requested desktop-only focus and plans a separate mobile implementation; narrow-layout checks above are fallback regression checks, not a mobile design deliverable.

Antislop gate: PASS. Functional controls and keyboard interaction exercised; no fabricated content added; source fonts, radii and palette retained; requested app icons identify window contents; frame spacing prevents overlap. Design reasons and ENERGY 2 / RHYTHM 3 / MOTION 1 are recorded in `desktop-design.md`. No push or deployment.

## Previous: independent desktop windows

- `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`: all exit 0.
- `npx tsc app/desktop/window-state.ts app/desktop/window-state.test.ts --outDir /tmp/portfolio-window-state-tests --module commonjs --target es2020 --esModuleInterop --skipLibCheck && node --test /tmp/portfolio-window-state-tests/window-state.test.js`: 7 passed, 0 failed.
- `PORT=3109 node /tmp/desktop-window-qa.cjs`: passed on production. Four experience records; project selection; open/close/minimize/restore; selected content preserved after minimize and Show Desktop; pointer dragging/resizing; keyboard movement/resizing; maximize/restore geometry; launcher/Escape; Contact; no page/content overflow or clipped sidebar controls at 1920×1080, 1440×900, 844×390, 390×844 and 320×740; zero runtime errors.
- Separate production smoke: root redirects to desktop, Skip boot works, repeat session skips boot, three initial windows present.
- `npm run start -- --port 3109`: ready in 102ms.

Screenshots were inspected against the actual source screenshots `pictures/1.png` and `pictures/triplewindows.png`, including native 1920×1080 composition. Used the existing isolated Chrome/Playwright fallback after T3 screenshot timeouts recorded below. Subagent review found landscape sidebar clipping and lost content on minimize; both were fixed and browser-tested. All prior dashboard/café checks below are historical. No push or deployment.

## Latest revision: Rumda fonts and illustrated drink ordering

- `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`: all exit 0.
- `npm run start -- --port 3109`: production server ready in 93ms.
- `PORT=3109 node /tmp/portfolio-layout-audit.cjs`: exit 0. Both routes HTTP 200; 320/390/800/1024/1440px no overflow, loaded images, named buttons, zero runtime errors.
- `PORT=3109 node /tmp/portfolio-order-check.cjs`: exit 0. All six drinks ordered at 1440/390/320px (18 orders); correct project/experience notes; sleeve opening/folding; focus transfer; repeat ordering; cancellation during brewing; normal/reduced motion; About/Contact; desktop projects/dialogs/rail and variant navigation; zero runtime errors.
- Computed production styles confirm loaded Terminess family and 12/9/8/7px dashboard/module/rail/control radii.

Inspected Rumda's source screenshot, generated desktop concept, illustrated café scene and drinks, and production screenshots with `view_image`. Desktop captured at concept-native 1586 × 992; café captured at asset-native width 1536 with a 1024px viewport and full-page continuation. Also inspected mobile layouts and served notes. Compared type, frame radii, composition, palette, image treatment, copy, and responsive continuation. Real shared portfolio copy replaces invented concept labels/images. Fixed clipped cup handles and neighboring sprite leakage with explicit SVG clips; opening notes now focuses and scrolls them into view on phones.

Used isolated headless Chrome after two T3 snapshot calls failed with `Preview automation snapshot timed out after 15000ms.` External destinations were checked as hrefs; third-party services were not exercised. Intentional adaptations: Japanese-inspired dark palette, real Flowcast screenshot, initials instead of the reference cat, mobile rail stacking, and an original illustrated café. No remaining material clipping or interaction mismatch was found in tested states. No push or deployment.

## Previous iteration (historical checks)

Verified locally on 2026-10-26, on branch `redesign/v2`. No deployment or push.

- `npm run lint`: exit 0.
- `npm run typecheck`: exit 0; route types generated and TypeScript passed.
- `npm run build`: exit 0; `/`, `/cafe`, `/desktop` and not-found prerendered successfully.
- `git diff --check`: exit 0.
- `npm run start -- --port 3109`: production server ready.
- `node /tmp/check-portfolio-v2-production.cjs`: exit 0. Root redirect; all three project selections/details; Escape and focus restoration; About/Contact; Work focus; no overflow at 1440, 800, 390 and 320px; reduced motion; blackout focus; repeat-session boot; zero page runtime errors.
- `node /tmp/check-cafe-v2-production.cjs`: exit 0. No café boot; all three selections/details at 1440, 1024, 801, 800, 390 and 320px; no page or dialog horizontal overflow; About/Contact; desktop navigation and boot skip; mobile desktop dialog; zero page runtime errors.
- Additional production browser smoke: rail shortcuts, education, expand, backdrop dismissal, home links and both variant links passed.

Browser scripts used the existing temporary Playwright installation with installed Chrome in an isolated headless browser. T3 preview navigation worked, but screenshot capture timed out twice, so screenshots used that fallback. Desktop and mobile screenshots were inspected against both generated concepts. External links were checked for actual destination hrefs; third-party services were not exercised.

Subagents implemented and reviewed the café and reviewed shared desktop/boot code. The reported invisible focused Skip control was fixed by moving focus to the startup dialog during the deliberately black transition. Parent verified the integrated production build and behavior.
