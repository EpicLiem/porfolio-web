# Coffee desktop: eight Wada palette references

Eight fixed screenshot variations for comparison, not a customizable UI. Six dark and two light. Direction names and coffee associations below are our design interpretations, not Wada titles or cultural claims.

## Evidence and derivation

Primary source: supplied [A Dictionary of Color Combinations](/Users/liem/.t3/userdata/attachments/mcp-63486230-b8db-4e92-82b8-e9620365e24a-451b2291-4374-483f-8c29-2fdf61f68500-pdf.pdf), 356 PDF pages. Page references below are **1-based PDF pages**; printed pages are also supplied. Full relevant pages were rendered at 120 dpi and visually inspected: 56, 60, 62, 69, 84, 98, 116, 120. English labels and combination IDs were read from those images. The noisy OCR was used only to locate candidates.

Source hex values below are approximate **scan samples**, using median RGB in a 25 x 25 pixel patch inside each rendered swatch. They are not exact book, ink, or authoritative digital values. Scan lighting, paper, texture, and conversion affect them. Repeated Vandyke Brown varies between pages. The UI tokens are separately designed tints/shades with contrast adjustments; pale ink and neutrals are added functional derivatives, not additional Wada combinations.

All eight IDs and color sets were cross-checked against the linked Wada Sanzo Colors pages. One naming difference: the website calls the middle color in #174 **Grayish Lavender 2**; the supplied PDF visibly says **Grayish Lavender**, retained below. Website hex values were not used.

## Source combinations

| Direction | Mode | Combination / cross-check | PDF page (printed) | Exact English labels and approximate scan hex, left to right | Application |
| --- | --- | --- | --- | --- | --- |
| Roast and indigo | dark | [#182](https://www.wada-sanzo-colors.com/combination/classic/182) | 120 (118) | Vandyke Brown #37231A; Raw Sienna #B24E11; Deep Indigo #1B1A1C | Near-black indigo desktop, brown windows, sienna actions. |
| Copper and teal | dark | [#058](https://www.wada-sanzo-colors.com/combination/classic/58) | 56 (54) | Sea Green #06908D; Hay's Russet #5D191A | Russet windows with teal actions; a cooler equipment-and-copper interpretation. |
| Olive and brass | dark | [#066](https://www.wada-sanzo-colors.com/combination/classic/66) | 60 (58) | Olive Green #4D4F1F; Olive Ocher #BD9107 | Olive structure and ocher actions, distinct from brown coffee themes. |
| Charcoal and steel | dark | [#069](https://www.wada-sanzo-colors.com/combination/classic/69) | 62 (60) | Black #161618; Warm Gray #8F9197 | Neutral equipment-like desktop; monochrome actions and underlined links. |
| Violet and oat | dark | [#083](https://www.wada-sanzo-colors.com/combination/classic/83) | 69 (67) | Violet Blue #2C2749; Olive Buff #A9AA85 | Violet structure with olive-buff highlights. |
| Berry and lavender | dark | [#174](https://www.wada-sanzo-colors.com/combination/classic/174) | 116 (114) | Taupe Brown #642D49; Grayish Lavender #A390AF; Corinthian Pink #CA9BB4 | Wine structure, pink actions, lavender links; Taupe Brown appears purple in this scan. |
| Porcelain and cocoa | light | [#113](https://www.wada-sanzo-colors.com/combination/classic/113) | 84 (82) | Seashell Pink #CFBCB5; Vandyke Brown #392719 | Pale pink porcelain windows and brown controls. |
| Pistachio and terracotta | light | [#137](https://www.wada-sanzo-colors.com/combination/classic/137) | 98 (96) | Etruscan Red #B32F1B; Pistachio Green #46786E; Cinnamon Buff #D7AB68 | Cinnamon paper, red actions, green links and selection. |

## Proposed UI tokens

Opaque sRGB hex. `canvas` = desktop; `surface` = window/panel; `frame` = meaningful control/window boundary; `inset` = recessed field; `ink` = primary text; `muted` = secondary text; `accent` = action/focus color; `selection` = selected background; `link` = underlined link text. Use **canvas-colored text on solid accent buttons**, and **ink on selection**. Do not put light ink on the pale accents in dark themes.

| Direction | canvas | surface | frame | inset | ink | muted | accent | selection | link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Roast and indigo | #19181C | #282027 | #88766C | #121115 | #F5E9DC | #C5AEA0 | #E9A46C | #553B30 | #EEB78C |
| Copper and teal | #211719 | #302023 | #8C7775 | #160F11 | #F5E9DF | #CBB1AA | #62D1C7 | #164E4B | #7ADBD2 |
| Olive and brass | #1B1D13 | #292B1C | #85866C | #11130C | #F2EED8 | #C1C2A4 | #E1BF50 | #484519 | #E7CB75 |
| Charcoal and steel | #161618 | #252528 | #808086 | #0D0D0F | #F2F0ED | #BEBDC4 | #D0CFD5 | #44434B | #DAD8E2 |
| Violet and oat | #1D192D | #2B263E | #89819E | #13101F | #F1EDDF | #BDB5CE | #C8C99E | #45432F | #D9DAB1 |
| Berry and lavender | #261923 | #372430 | #957C92 | #190F17 | #F8EAF0 | #D0B7C9 | #E5B2CD | #58354C | #D7C0EC |
| Porcelain and cocoa | #F3E7E1 | #FCF5F0 | #8D766B | #E6D6CC | #38261E | #70564A | #70432E | #DCC4B4 | #714329 |
| Pistachio and terracotta | #F5E8D3 | #FFF7E9 | #8A7359 | #E8D6B9 | #342A20 | #6D5943 | #A13625 | #CCDDD0 | #285C50 |

## Contrast verification

Python calculated sRGB relative luminance and `(Llighter + 0.05) / (Ldarker + 0.05)`. All eight pass the tested thresholds: 4.5:1 text and 3:1 meaningful boundaries. Text column is the minimum across ink/muted/link/accent against each of canvas/surface/inset (12 pairs per palette). Frame column is the minimum against those same three backgrounds. Results are rounded only for display; assertions used unrounded values.

| Direction | Minimum text | Minimum frame | Ink on selection | Canvas text on accent |
| --- | ---: | ---: | ---: | ---: |
| Roast and indigo | 7.49:1 | 3.66:1 | 8.55:1 | 8.40:1 |
| Copper and teal | 7.67:1 | 3.69:1 | 7.91:1 | 9.54:1 |
| Olive and brass | 7.91:1 | 3.86:1 | 8.41:1 | 9.56:1 |
| Charcoal and steel | 8.20:1 | 3.89:1 | 8.59:1 | 11.68:1 |
| Violet and oat | 7.36:1 | 3.93:1 | 8.55:1 | 10.01:1 |
| Berry and lavender | 7.75:1 | 3.83:1 | 8.88:1 | 9.30:1 |
| Porcelain and cocoa | 4.76:1 | 3.01:1 | 8.60:1 | 6.85:1 |
| Pistachio and terracotta | 4.67:1 | 3.15:1 | 9.89:1 | 5.66:1 |

Selection fills are not guaranteed to contrast 3:1 with adjacent surfaces: use an accent outline plus a non-color selected marker, and use ink text within them. Underline links. Frame is a boundary color, not a text surface. Opacity, images behind text, gradients, hover combinations, and full UI accessibility have not been tested. These are numerical token checks, not a runtime certification.

Verification: rendered eight complete PDF pages with `pdftoppm -f N -l N -r 120 INPUT /tmp/coffee-wada-reference/page-N`, converted PPM to PNG using `sips`, inspected the PNGs, and sampled with Pillow. Inline `python3` contrast assertions passed all 136 tested pairs (17 per palette). `git diff --check -- docs/coffee-palettes-reference.md` passed. No app/browser/build run; no source PDF edits. Temporary render evidence is outside the repository at `/tmp/coffee-wada-reference/page-N.png`.
