# Coffee desktop wallpapers

Curated 2026-10-26 for the Rumda desktop. Ten non-cat wallpapers selected after visual inspection of 18 candidates, followed by larger inspection of all ten selections. The selection mixes an illustrated café, a photographic tea still life, foliage, Japanese-inspired scenes, mountain landscapes, and rain. Labels below are editorial descriptions, not artist-provided titles or verified real-world locations.

## Selection and pairings

Paths are public web paths; files live in `public/desktop/wallpapers/`. Palette hex values are four representative colors quantized from each resized image, not UI contrast guarantees. Pairing suggestions describe desktop chrome only; no UI changes were made.

| Label | Path | Image palette | Recommended pairing |
| --- | --- | --- | --- |
| Corner Coffee | `/desktop/wallpapers/coffee-shop.webp` | #BAB6D3, #37384A, #9694AF, #5F6177 | Best default: illustrated café frontage; pair with espresso panels and cream labels. |
| Pistachio Break | `/desktop/wallpapers/pistachio-tea.webp` | #C0C8C7, #525567, #222331, #8D8EA0 | Photographic tea and macarons; pair with dark cocoa panels and pistachio accents. Source calls this tea, not coffee. |
| Coastal Greenway | `/desktop/wallpapers/beach-path.webp` | #141520, #A8C2A6, #20222F, #545C64 | Leafy Japanese seaside path; pair with espresso panels and sage accents. |
| Rose Mountain Dusk | `/desktop/wallpapers/mountain-range.webp` | #2F3141, #1A1A27, #5F5E72, #C8929D | Painterly mountain panorama; pair with cocoa panels and muted rose accents. |
| Quiet Pine | `/desktop/wallpapers/pine.webp` | #1B1D2A, #343646, #202230, #676B7F | Close-up evergreen texture; pair with cream labels and restrained caramel accents for focused work. |
| Sakura Gate | `/desktop/wallpapers/sakura-gate.webp` | #181925, #515366, #9FAABE, #282A39 | Dramatic shaded gate and blossoms; pair with espresso panels and dusty pink accents. |
| Temple Morning | `/desktop/wallpapers/temple.webp` | #E2D2D1, #BDC6DD, #ACACC6, #7B7B91 | Bright pagoda scene; pair with opaque cream panels, dark brown text, and terracotta accents. |
| Rain at Closing Time | `/desktop/wallpapers/rainy-window.webp` | #3A3C4C, #191B27, #242634, #927D88 | Rainy city sunset; pair with deep espresso panels and warm peach accents. |
| Lantern River | `/desktop/wallpapers/serenity.webp` | #1A1C28, #292B3A, #161723, #5F5E71 | Quiet river, lanterns, and mountain village; pair with cream labels and muted rose accents. |
| Winter Railway | `/desktop/wallpapers/snowy-train.webp` | #AECBE1, #62667A, #C3D3DB, #9498B1 | Open sky and snowy rail landscape; pair with cream panels and cocoa text for a lighter desktop. |

Suggested starting choices: **Corner Coffee** for the café identity, **Lantern River** for an evening workspace, and **Winter Railway** for a quieter daytime desktop. Suggested shared chrome colors: espresso `#2B211D`, cocoa `#4A352B`, cream `#F1E6D2`, caramel `#C99B6B`, sage `#A6B89A`, and muted rose `#CB9BA5`. These are proposed pairings, not extracted project tokens. Use opaque label/panel backgrounds where image detail interferes with readability.

## Exact sources and processing

All downloads are from [orangc's Catppuccin Mocha collection](https://files.orangc.net/media/walls-catppuccin-mocha/). Each source link below names the exact downloaded original file in that collection; these are already color-converted collection versions, not necessarily the artist's original master.

| Exact source filename / URL | Local filename | Source → output pixels | Output bytes | WebP quality |
| --- | --- | --- | ---: | ---: |
| [coffee-shop.png](https://files.orangc.net/media/walls-catppuccin-mocha/coffee-shop.png) | coffee-shop.webp | 1139×640 → 1139×640 | 131,392 | 85 |
| [pistachio-tea.jpg](https://files.orangc.net/media/walls-catppuccin-mocha/pistachio-tea.jpg) | pistachio-tea.webp | 1920×1200 → 1920×1200 | 190,372 | 85 |
| [beach-path.jpg](https://files.orangc.net/media/walls-catppuccin-mocha/beach-path.jpg) | beach-path.webp | 1920×1080 → 1920×1080 | 333,036 | 85 |
| [mountain-range.jpg](https://files.orangc.net/media/walls-catppuccin-mocha/mountain-range.jpg) | mountain-range.webp | 1920×1080 → 1920×1080 | 275,664 | 85 |
| [pine.jpg](https://files.orangc.net/media/walls-catppuccin-mocha/pine.jpg) | pine.webp | 1920×1080 → 1920×1080 | 181,012 | 85 |
| [sakura-gate.jpg](https://files.orangc.net/media/walls-catppuccin-mocha/sakura-gate.jpg) | sakura-gate.webp | 4420×2486 → 1920×1080 | 213,564 | 85 |
| [temple.jpg](https://files.orangc.net/media/walls-catppuccin-mocha/temple.jpg) | temple.webp | 3840×2160 → 1920×1080 | 157,264 | 85 |
| [rainy-window.jpeg](https://files.orangc.net/media/walls-catppuccin-mocha/rainy-window.jpeg) | rainy-window.webp | 1920×1080 → 1920×1080 | 155,954 | 85 |
| [serenity.jpg](https://files.orangc.net/media/walls-catppuccin-mocha/serenity.jpg) | serenity.webp | 1920×1080 → 1920×1080 | 152,332 | 85 |
| [snowy-train.jpg](https://files.orangc.net/media/walls-catppuccin-mocha/snowy-train.jpg) | snowy-train.webp | 1920×1080 → 1920×1080 | 52,040 | 85 |

Pillow processing: EXIF orientation, RGB conversion, aspect-preserving Lanczos thumbnail within 1920×1920 without upscaling, WebP quality 85 with method 6 (lowered only if needed to stay at or below 600,000 bytes). No generated imagery, recoloring, retouching, cropping, or removed signatures. All compositions are landscape; the tea photograph is 16:10 and the others are approximately 16:9. Displaying with cover may crop at different desktop aspect ratios.

## Attribution and license evidence

Read both the [Mocha README](https://files.orangc.net/media/walls-catppuccin-mocha/README.md) and [normal collection README](https://files.orangc.net/media/walls/README.md) on 2026-10-26. Both describe orangc as a collector, not the artist; the Mocha README describes conversion with lutgen and some edits. The only named artwork credit in either README is for `space-piano.png`, which is not selected here.

**Artist: unknown for each of these ten files. License: unspecified for each of these ten files in the inspected collection documentation.** Collector/color editor: orangc. Visible signatures in some images are preserved; no identity was inferred from an unreadable signature. Collection availability is not evidence of a redistribution license. No CC, public-domain, or other permission claim is made.

## Selected default: Coffee line drawing

The user selected the coffee line drawing with the Roast & indigo palette. Local asset: `public/desktop/wallpapers/coffee-line.jpg` (2880 × 1800), copied unchanged from the downloaded original.

Source: [Coffee — minimal wallpaper](https://minimalwallpaper.weebly.com/home/coffee). Original image: https://minimalwallpaper.weebly.com/uploads/5/2/3/4/52342127/mg_coffee.jpg. This replaces Corner Coffee as the fixed default; the earlier studies remain available for reference.

## Verification

Inspected an 18-image contact sheet and larger views of the ten selected compositions; no visible cats in the selected set. Reopened all optimized files and inspected the final contact sheet for composition, compression, and preserved content. Automated verification asserts exactly the ten expected files, WebP format, landscape orientation, maximum dimension ≤1920, and size ≤600,000 bytes per image.

Verification command: `python3 /tmp/coffee-wall-review/verify.py` (temporary local audit script; not a project dependency). No build or server was run. Edits are limited to this document and the ten wallpaper assets.
