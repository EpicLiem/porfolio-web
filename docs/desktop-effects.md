# Terminal effect references

These are browser recreations from visually inspected game footage, not extracted game shaders. The short timing is adapted to a portfolio interaction.

## Video cadence review

- [Relic video, 23–34 seconds](https://www.youtube.com/watch?v=2ICiDTx692k&t=23): smooth camera sag and blurred double images. The triangle appears around 28.4s; the warning expands once around 29.2–29.6s. It is not a countdown/loading bar. Relic now uses two inert, aria-hidden visual snapshots animated by the compositor instead of recomputing full-screen SVG displacement, blur, and channel separation every frame. Its artificial countdown bar and 110ms noise stepping were removed. Snapshots are removed at sequence completion/replacement.
- [Sandevistan video, 32.6–33.8 seconds](https://www.youtube.com/watch?v=cuOVDjoiXE0&t=32): rapid cyan radial blur onset, continuous motion, clear center, then recovery. The portfolio adds a radial lens displacement map for the requested FOV-like treatment. The lens is rendered on one inert visual snapshot with fixed filter parameters; compositor opacity/transform animations blend it over the live desktop. No per-frame displacement/blur changes or backdrop blur. Completion removes the snapshot and cancels its animations.
- [Blackwall video, 475.8–477.5 seconds](https://www.youtube.com/watch?v=k0IFSL4_3l8&t=475): broken edge fragments build into red/pink columns, then decay into sparse interference. Removed polygonal lightning and the large warning banner from the portfolio version.

- **Relic, 3.4 seconds:** [Tapeworm gameplay screenshot](https://static1.millenium.org/articles/2/39/48/82/%40/1630065-tapeworm1-full-1.jpg), [source guide](https://www.millenium.org/guide/394882.html). Offset scene contours, horizontal corruption, and a red warning frame with cyan text. Relic uses composited visual snapshots of the real desktop; see the video cadence review above.
- **Sandevistan, 4.2 seconds:** [gameplay at 00:32](https://www.youtube.com/watch?v=cuOVDjoiXE0&t=32), [vanilla comparison](https://staticdelivery.nexusmods.com/mods/3333/images/headers/9776_1696794310.jpg). Cyan/desaturated image, peripheral blur, activation surge and recovery. Removed the green afterimages and arbitrary slow window transitions; those were not a faithful match to this vanilla reference.
- **Blackwall, 3.6 seconds:** [gameplay at 07:47](https://www.youtube.com/watch?v=k0IFSL4_3l8&t=467). Sparse luminous red/pink vertical columns, broken code blocks, contour separation, and fragmented pixel columns. No regular red grid or Matrix-style falling code. Full-screen white impact flashes are omitted.
- **Night City, 3 seconds:** atmospheric rain/title interlude, not a claim to reproduce a named game ability.
- **Matrix, 3.2 seconds:** separate digital-rain Easter egg; not a Cyberpunk effect.

Each sequence has an attack, peak, and recovery. One runs at a time; retriggering replaces it and starts a fresh timeline. Completion, reduced-motion preference changes, and component unmount remove filters and release animation frames, compositor animations, snapshots, timers, and listeners. Reduced motion uses a 650 ms low-opacity static treatment without snapshots. No screenshot capture, new packages, or changes to application state.

## Sound

Each effect has a Web Audio cue synthesized in `app/desktop/effects/effect-sound.ts`; no audio files are shipped. Cues follow the visual timeline: Sandevistan charges into a sub drop and air rush at the 16% surge, holds a slowed drone with heartbeat thumps, then rushes back at 72%. Relic layers an overdriven, tremoloed hum shaped by the interference curve with digital stutters around the surge and echo. Blackwall swells into an ignition boom at 20% over a distorted drone, electrical crackle, and a thin high tone. Night City plays a filtered A minor 9 synth stab, a plucked arpeggio, and rain. Matrix uses a falling tone and pentatonic blips. Completion or replacement fades the cue out in 120 ms. The reduced-motion treatment is silent.

Recorded cues can replace the synthesized ones. Put the file in `public/desktop/sfx/`, add it to `recorded` in `effect-sound.ts` (for example `relic: "relic.mp3"`), and record its source and license next to the file. A recording plays once from the start of the effect and fades out with it. Only use audio you have the rights to publish; Cyberpunk 2077 game audio belongs to CD Projekt Red and is not included.
