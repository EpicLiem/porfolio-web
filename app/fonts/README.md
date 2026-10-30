# Boot console font

Web437 IBM VGA 8x16, from The Ultimate Oldschool PC Font Pack v2.2 by VileR.

Source: https://int10h.org/oldschool-pc-fonts/

Licensed under CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
The original license is included in LICENSE.txt. The WOFF file is unmodified.

This webfont reproduces the classic VGA console glyphs; it is not a font
distributed by the Archiso project. Render at 16 px (or integer multiples)
to preserve its pixel geometry.

# Desktop fonts

`terminess-regular.ttf` and `terminess-bold.ttf` are the original, full-glyph
Terminess fonts used by the desktop. Their license is included in
`terminess-LICENSE.txt`. Keep these source files; the social-image renderer
also uses the regular TTF.

The matching `.woff2` files are generated browser subsets. They retain every
non-private-use Unicode mapping supported by the original fonts, not just
characters currently visible in the portfolio. This preserves the fonts'
existing support for dynamic guestbook and terminal text. Unused Nerd Font
private-use icons are omitted.

`scripts/prepare-fonts.mjs` recursively scans `.ts`, `.tsx`, `.js`, `.jsx`,
`.css`, and `.json` files in `app/` and `lib/` for private-use characters. It
recognizes literal Unicode, JavaScript `\uNNNN`, `\u{...}` and surrogate-pair
escapes, CSS hexadecimal escapes, and decimal/hexadecimal numeric HTML
entities. Comments are included conservatively. If runtime code constructs
an icon numerically or receives it remotely, declare that icon in a literal
string in an `app/` or `lib/` source file so it is included in the scan.

After `npm ci`, generate or verify with the pinned `subset-font` and `fontkit`
dependencies from `package-lock.json`:

```sh
node scripts/prepare-fonts.mjs
node scripts/prepare-fonts.mjs --check
node --test scripts/prepare-fonts.test.mjs
```

Generation is deterministic and does not rewrite unchanged files. `--check`
recomputes the expected subsets without writing: missing, stale or corrupted
outputs fail. Both modes verify retained cmap coverage, glyph outlines,
advance widths and overall ascent/descent/line-gap metrics against the TTF
sources. A referenced private-use character missing from either original
font fails the build, as does a subset exceeding 100 KiB per font. No Python
or system font tools are needed.

The current source uses U+F0219 and U+F024B. Together with the 1,371 retained
non-private-use characters, the 1,373-character subsets are 20,156 bytes
(regular) and 20,324 bytes (bold), down from 2,661,616 and 2,662,456-byte TTFs.
These byte counts may change when source icons or pinned tools change.
