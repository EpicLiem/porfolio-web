# Rumda desktop

## Coffee studies, current revision

The user requested coffee instead of cats and fixed screenshot alternatives rather than customization. The rail uses a steaming cup; About uses a pour-over emblem. These small SVG symbols identify the coffee interest without replacing the functional desktop with a café scene. Fonts, tiling, radii and keyboard interactions remain.

The fixed provisional default is Roast & indigo (#182) with Corner Coffee. Eight palette studies are captured at 1600×1000 in `coffee-studies/`, each with a tiled desktop and an unobstructed wallpaper view. Alternate colors are applied only in the capture browser, not through a site preference or theme picker. `coffee-palettes-reference.md` records the source combinations and contrast checks; `coffee-wallpapers.md` records asset sources. The comparison gallery is a review artifact, not an app route. The older cat references below describe the original geometry research, not current displayed artwork.

This version uses Rumda's actual desktop as the reference: a narrow left shell bar and automatically tiled application windows. No website header or top navigation remains. The café experiment is retained on its route but has no link in this desktop.

## Source inspection

Inspected the dotfiles at hexonide/rumda commit `41e94b7133f46db7ea02e4eca360e2bb0a999539`, cloned read-only to `/tmp/rumda-desktop-reference`. No installer or scripts executed.

- [pictures/1.png](https://github.com/hexonide/rumda/blob/41e94b7133f46db7ea02e4eca360e2bb0a999539/pictures/1.png): spatial reference for floating neofetch and file-manager windows.
- [pictures/triplewindows.png](https://github.com/hexonide/rumda/blob/41e94b7133f46db7ea02e4eca360e2bb0a999539/pictures/triplewindows.png): compact editor text, file status line, separate framed applications, no top bar.
- [dark-config/hypr/hyprland.conf](https://github.com/hexonide/rumda/blob/41e94b7133f46db7ea02e4eca360e2bb0a999539/dark-config/hypr/hyprland.conf): 7px corners, 3px window borders, 45/40px outer gaps, additional compositor border.
- [Config.qml](https://github.com/hexonide/rumda/blob/41e94b7133f46db7ea02e4eca360e2bb0a999539/common/quickshell/dark/config/Config.qml): 48px bar plus border, left18/top80/bottom80, 8px bar corners, 7px modules.
- [kitty.conf](https://github.com/hexonide/rumda/blob/41e94b7133f46db7ea02e4eca360e2bb0a999539/dark-config/kitty/kitty.conf): Terminess Nerd Font, 12pt (16 CSS pixels), compact padding, hidden OS decorations.
- ClockModule.qml uses Dogica Pixel at 9px. The source's diagonal workspace indicators are replaced with app icons at the user's request.

The previous generated dashboard concept is superseded. Real source screenshots are the visual specification; no new generated reinterpretation was used.

## Visual implementation

Self-hosted Terminess and Dogica from the prior source inspection are retained with their licenses. Body type returns to 16px, rather than oversized 20–36px dashboard text. Ink/indigo/kinari/persimmon colors remain an intentional adaptation. Windows have compact content, a thin draggable title area, 7px corners, 3px borders and an 8px secondary edge. The secondary edge is slightly thinner than the compositor's 13px extra border to keep browser controls usable at smaller sizes.

The actual Rumda wallpaper and cat glyphs are used, not substitute art. Files in `public/desktop/rumda/` derive from the above source commit:

- `wallpaper.png`: pictures/dark-wallpaper.png, unmodified.
- `catsit.svg`: common/quickshell/dark/icons/catsit.svg, used as a CSS mask.
- `cat-face.svg`: common/quickshell/dark/icons/connected.svg, used as a CSS mask.
- `fetch-cat.svg`: common/neofetch/2.svg, used as a CSS mask. Its embedded attribution names SVG Repo.
- `cat.png`: unused source image retained from inspection; not referenced by the page.

The source icons keep their embedded attribution. Rumda is credited in the Help window. These are reference assets for the local design branch; no deployment has occurred.

ENERGY 2 / RHYTHM 3 / MOTION 1. Desktop identity comes from the source shell geometry and app content. The clock is actual local time. The source volume-slot is a real text-size slider, ring controls open Projects/Experience, app icons focus/restore windows, and bottom controls open GitHub, Contact, the launcher, and Show Desktop. Terminal, folder, briefcase, envelope and keyboard icons identify the corresponding apps. SVG geometry and padding-free grid alignment avoid font-bearing alignment errors. These functional substitutions are intentional browser adaptations, not a claim to run Hyprland.

## Windows and content

Initial desktop: About, Projects, Experience and Keybindings are open. Contact can be opened from its sidebar icon or the launcher. Four career entries use verified prior content, with Honeycake corrected to ongoing CIO and Good-Loop's patent application still in progress.

Visible windows recursively split the workspace with an 18px gap, leaving room for the 8px frame edges. Opening, closing, minimizing and restoring immediately retile the remaining windows. Dragging one title onto another swaps tiles. Arrow keys on a focused title focus a neighbor; Shift+arrows swap tiles. Maximize temporarily displays one window; restoring returns to tiling. Minimized and inactive mobile windows retain their selected file. Closed windows reset content when reopened. Show Desktop hides and restores the open set. Below 700px workspace width, only the active window is shown at full size; sidebar icons switch apps. Short screens compact the bar so controls remain available.

Arrow and Shift+arrow shortcuts also work from window content, sidebar buttons and the desktop background. They do not intercept input fields, editable content, browser modifier shortcuts, dialogs or boot input.

The site-content wrapper creates a stacking context beneath the boot overlay. This contains all sidebar/window stacking levels during the intro and blackout, while the existing inert/focus handling prevents interaction underneath.

## Verification and fidelity

Compared real Rumda screenshots and implementation captures with `view_image` at 1920×1080, 1440×900, 390×844 and 844×390. Inspected: absence of top bar; exact sidebar location/width; compact fonts; separate rounded frames; wallpaper/cat treatment; file-tree/editor/status-line structure; content and links; narrow-screen controls. Corrected an opaque cat-image background by using the actual full wallpaper. Also fixed minimized state loss and landscape bar clipping found by independent review.

Intentional deviations: portfolio files replace system/program content; tiny title controls provide browser window operations; text-size control replaces OS volume; window positions adapt to viewport rather than using a compositor; active border uses the palette accent; mobile uses full-workspace windows. No claim of pixel identity across different viewport sizes. Runtime checks and exact commands are recorded in `verification.md`.

## Hyprland motion

The desktop uses Rumda's `easeOutQuint` and `fakeElastic` curves from `dark-config/hypr/hyprland.conf`: 300ms bottom-up window entry, 160ms upward exit, 300ms tiling/maximize geometry transitions, and 140ms focus-border changes. The launcher opens with a 220ms eased pop-in and fading backdrop. Exit windows immediately become inert and leave the accessibility tree; closed children unmount after 160ms, while minimized children preserve their drafts. Reopening during an exit cancels its pending removal. Inactive geometry stays unchanged so exiting windows do not expand to fill the workspace. Reduced motion disables all added movement, including when the preference changes during a session.

Verification: `npm run lint` and `npm run build` passed; `npx tsx --test app/desktop/window-state.test.ts` passed 8/8. `node /tmp/check-hypr-motion.cjs` passed real-browser entry/exit, geometry transitions, maximize/restore, inert exit, rapid reopen, preserved drafts, close cleanup, launcher motion, and live reduced-motion checks with no page errors. Screenshot `/tmp/hypr-motion-desktop.png` inspected. T3 preview snapshot timed out twice; used isolated Chrome as fallback. No dependencies added.

## Readability and window-shadow revision

The user's updated direction removes the font-size slider and double window outline. Desktop body and launcher text now use Terminess at 20px/1.45; secondary copy, status text, clock digits, and chess coordinates use at least 16px. The launcher uses the same readable desktop face instead of 10px pixel text. Windows retain a 1px focus-sensitive edge and use a downward blurred shadow to separate tiles from the wallpaper; the solid outer ring is removed at every breakpoint. Existing coffee colors, transparency, tiling, and keyboard behavior remain.

Verification: lint, typecheck, production build, and diff checks passed. `node /tmp/check-desktop-readability.cjs` passed at 1600×1000 and 1280×800: no slider, computed visible text at least 16px, 20px desktop and launcher, 1px edges and blurred shadows, no horizontal overflow in tiled/maximized apps, and no page errors. Opened Contact, Guestbook, Chess, and launcher and exercised maximize/close/Escape. Inspected desktop and chess screenshots; reduced chessboard height to leave space for the larger instruction text.

Scoped antislop gate: PASS. The existing coffee desktop is the explicit direction (energy 2, rhythm 2, motion 2). Type size serves reading; shadow serves window separation; the board remains the chess focal point. No invented content or decorative assets, no new navigation or controls, no muted text-color changes, and existing keyboard focus is retained. Desktop scope follows the user's separate mobile-site plan.
